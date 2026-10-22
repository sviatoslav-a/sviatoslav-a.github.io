import { test, expect } from '@playwright/test';

test('camera switch preserves mute and restores original camera after capture failure', async ({ page, context, browserName }) => {
 test.skip(browserName === 'webkit', 'Synthetic capture is Chromium only.');
 await context.grantPermissions(['camera','microphone']);
 await page.addInitScript(() => {
  const capture=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  navigator.mediaDevices.enumerateDevices=async()=>[{kind:'videoinput',deviceId:'front',label:'Front camera'},{kind:'videoinput',deviceId:'back',label:'Back camera'}];
  window.camera='front';window.failNext=false;
  navigator.mediaDevices.getUserMedia=async options=>{
   if(options.video?.deviceId?.exact && window.failNext){window.failNext=false;throw new DOMException('Camera busy','NotReadableError');}
   const media=await capture({...options,video:options.video?true:false});
   if(options.video){const id=options.video?.deviceId?.exact||'front';window.camera=id;const raw=media.getVideoTracks()[0],get=raw.getSettings.bind(raw);raw.getSettings=()=>({...get(),deviceId:id,facingMode:id==='back'?'environment':'user'});}
   return media;
  };
 });
 await page.goto('/');await expect(page.locator('body')).toHaveAttribute('data-connected','true');
 await page.locator('#stage').click({position:{x:15,y:300}});
 await expect(page.locator('#switch-camera')).toBeVisible();
 await page.locator('#toggle-video').click();
 await page.locator('#switch-camera').click();
 await expect.poll(()=>page.evaluate(()=>window.camera)).toBe('back');
 await expect(page.locator('#toggle-video')).toHaveAttribute('aria-pressed','false');
 await expect(page.locator('#self-video')).toHaveCSS('transform','none');
 await page.locator('#toggle-video').click();
 await page.evaluate(()=>window.failNext=true);
 await page.locator('#switch-camera').click();
 await expect(page.locator('#notice-text')).toContainText('Camera is in use');
 await expect.poll(()=>page.evaluate(()=>document.querySelector('#self-video').srcObject?.getVideoTracks()[0]?.readyState)).toBe('live');
 expect(await page.evaluate(()=>window.camera)).toBe('back');
 await expect(page.locator('#switch-camera')).toBeEnabled();
 await page.locator('#switch-camera').click();await expect.poll(()=>page.evaluate(()=>window.camera)).toBe('front');
 await expect(page.locator('#self-video')).not.toHaveCSS('transform','none');
});

test('receive-only peer is visible even without publishing tracks', async ({ browser, browserName, baseURL }) => {
 test.skip(browserName === 'webkit', 'Synthetic capture is Chromium only.');
 const a=await browser.newContext({permissions:['camera','microphone']}),b=await browser.newContext();
 try {
  const caller=await a.newPage(),viewer=await b.newPage();
  await caller.goto(baseURL);await expect(caller.locator('body')).toHaveAttribute('data-connected','true');
  const [,room,secret]=new URL(caller.url()).hash.slice(1).split('.');await viewer.goto(baseURL);
  await viewer.evaluate(async({room,secret})=>{
   const {privateSDK}=await import('./secure-sdk.js');window.listener=privateSDK(secret,room);
   window.video=document.createElement('video');video.autoplay=true;video.muted=true;document.body.append(video);
   listener.addEventListener('track',({detail})=>{if(detail.track.kind==='video'){video.srcObject=new MediaStream([detail.track]);video.play();}});
   const streams=new Set();listener.addEventListener('listing',({detail})=>{for(const item of detail.list||[])if(item.streamID||typeof item==='string')streams.add(item.streamID||item);});
   await listener.connect();await listener.joinRoom({room});await listener.view([...streams][0],{audio:true,video:true});
  },{room,secret});
  await viewer.waitForFunction(()=>video.videoWidth>0,{timeout:30000});
  await expect(caller.locator('.participant')).toHaveCount(1);
  await expect(caller.locator('.participant-placeholder')).toBeVisible();
  await viewer.evaluate(()=>listener.disconnect());await expect(caller.locator('.participant')).toHaveCount(0);
 } finally {await a.close();await b.close();}
});
