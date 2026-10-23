'use strict';
const cv=document.getElementById('c'),g=cv.getContext('2d');const W=240,H=400;g.imageSmoothingEnabled=false;
const PLANETS=[['EARTH','#3a7bff','#3c3'],['MARS','#d5532b','#922'],['JUPITER','#d9a066','#a65'],['SATURN','#e8d08a','#b93'],['URANUS','#7fe0e0','#4aa'],['NEPTUNE','#3050ff','#22a'],['PLUTO','#c8b8a8','#887']];
const COMETC=['#6cf','#f6c','#6f6','#fc4','#f84','#c8f','#fff'];
const UPG=['SINGLE','TWIN SHOT','SPREAD','SIDE PODS','REAR SHOT','LASER','SHIELD','HOMING','MAX POWER'];
let A=null;function snd(f,d,t='square',v=.08,sl=0){try{A=A||new(window.AudioContext||window.webkitAudioContext)();const o=A.createOscillator(),q=A.createGain();o.type=t;o.frequency.value=f;if(sl)o.frequency.exponentialRampToValueAtTime(Math.max(20,sl),A.currentTime+d);q.gain.setValueAtTime(v,A.currentTime);q.gain.exponentialRampToValueAtTime(.001,A.currentTime+d);o.connect(q);q.connect(A.destination);o.start();o.stop(A.currentTime+d)}catch(e){}}
function noise(d,v=.15){try{A=A||new AudioContext();const b=A.createBuffer(1,A.sampleRate*d,A.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*(1-i/a.length);const s=A.createBufferSource(),q=A.createGain();q.gain.value=v;s.buffer=b;s.connect(q);q.connect(A.destination);s.start()}catch(e){}}
const S={shot:()=>snd(880,.05,'square',.03,440),boom:()=>{noise(.3);snd(120,.3,'sawtooth',.06,30)},big:()=>{noise(.8,.3);snd(80,.8,'sawtooth',.1,20)},part:()=>{snd(660,.08);setTimeout(()=>snd(990,.1),70)},up:()=>[523,659,784,1047].forEach((f,i)=>setTimeout(()=>snd(f,.12,'square',.06),i*80)),hit:()=>snd(200,.05,'square',.04,100),dmg:()=>snd(90,.15,'triangle',.1,60),bomb:()=>{noise(1,.3);snd(400,1,'sawtooth',.08,40)}};
// music: simple original arpeggio loop
let mt=0,mOn=true;const MEL=[0,3,7,10,7,3,0,-2,0,3,7,12,10,7,5,3];function music(){if(!mOn||!A||st.mode==='title')return;mt++;const n=MEL[mt%16];snd(110*Math.pow(2,n/12),.12,'triangle',.035);if(mt%4==0)snd(55*Math.pow(2,MEL[(mt/4|0)%16]/12),.25,'square',.02)}setInterval(music,150);
// input
let tx=null,ty=null,ox=0,oy=0,touching=false,bombReq=false;
function pos(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]}
cv.addEventListener('pointerdown',e=>{if(!A)snd(1,.01);const[x,y]=pos(e);if(st.mode!=='play'&&st.mode!=='inside'&&st.mode!=='comet'){tapAdvance();return}
 if(Math.hypot(x-212,y-372)<24){bombReq=true;return}touching=true;ox=x;oy=y;cv.setPointerCapture(e.pointerId)});
cv.addEventListener('pointermove',e=>{if(!touching)return;const[x,y]=pos(e);P.x+=(x-ox)*1.3;P.y+=(y-oy)*1.3;ox=x;oy=y});
cv.addEventListener('pointerup',()=>touching=false);cv.addEventListener('pointercancel',()=>touching=false);
const K={};addEventListener('keydown',e=>{K[e.key]=1;if(e.key==='b'||e.key==='x')bombReq=true;if(st.mode!=='play'&&st.mode!=='inside'&&st.mode!=='comet'&&(e.key==='Enter'||e.key===' '))tapAdvance()});addEventListener('keyup',e=>K[e.key]=0);
// state
let hi=+localStorage.getItem('cd_hi')||0;
const st={mode:'title',planet:0,stage:0,t:0,score:0,damage:0,lives:3,bombs:3,msg:'',msgT:0,flash:0,shake:0,descend:0};
const P={x:120,y:340,lvl:0,parts:0,inv:0,shield:0,alive:true,fireT:0,respawn:0};
let B=[],EB=[],E=[],R=[],PT=[],FX=[],stars=[],boss=null,comet=null,core=null;
for(let i=0;i<70;i++)stars.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()*2+.3});
const rnd=(a,b)=>a+Math.random()*(b-a);
function say(m,t=120){st.msg=m;st.msgT=t}
function startGame(){Object.assign(st,{planet:0,stage:0,score:0,damage:0,lives:3,bombs:3});P.lvl=0;P.parts=0;startStage()}
function startStage(){st.mode='play';st.t=0;E=[];R=[];EB=[];B=[];PT=[];boss=null;comet=null;core=null;P.x=120;P.y=340;P.inv=120;P.alive=true;say(PLANETS[st.planet][0]+' STAGE '+(st.stage+1))}
function tapAdvance(){if(st.mode==='title')startGame();else if(st.mode==='over'&&st.t>60){st.mode='title'}else if(st.mode==='bonus'&&st.t>90)nextStage()}
function nextStage(){if(st.stage==0){st.stage=1}else{st.stage=0;st.planet++;st.damage=0;if(st.planet>=PLANETS.length){st.planet=0;say('SOLAR SYSTEM SAVED!',200)}}startStage()}
// weapons
function fire(){const l=P.lvl,x=P.x,y=P.y-8;const b=(x,y,vx,vy,d=1,k='b')=>B.push({x,y,vx,vy,d,k});
 if(l>=5){b(x,y-4,0,-9,2.5,'laser')}else if(l>=1){b(x-3,y,0,-7);b(x+3,y,0,-7)}else b(x,y,0,-7);
 if(l>=2){b(x-4,y,-1.6,-6.5);b(x+4,y,1.6,-6.5)}
 if(l>=8){b(x-6,y,-3,-6);b(x+6,y,3,-6)}
 if(l>=3){for(const s of[-1,1])b(x+s*16,y+6,0,-7,1,'pod')}
 if(l>=4){b(x,y+16,0,6);if(l>=8){b(x-4,y+16,-1.5,5.5);b(x+4,y+16,1.5,5.5)}}
 if(l>=7&&st.t%3==0){for(const s of[-1,1])b(x+s*10,y+4,s*2,-3,2,'hom')}
 S.shot()}
function collect(){P.parts++;st.score+=50;S.part();const need=2+Math.min(P.lvl,4);if(P.parts>=need&&P.lvl<8){P.parts=0;P.lvl++;S.up();say(UPG[P.lvl]+'!',90);if(P.lvl==6)P.shield=3}if(P.lvl>=6&&P.shield<3&&P.parts==0)P.shield++}
function playerHit(){if(P.inv>0||!P.alive)return;if(P.shield>0){P.shield--;P.inv=40;S.hit();boomAt(P.x,P.y,6,'#6cf');return}
 P.alive=false;S.big();boomAt(P.x,P.y,40,'#fc6');st.shake=20;st.lives--;const lost=Math.min(P.lvl,3);
 for(let i=0;i<lost;i++)PT.push({x:P.x,y:P.y,vx:rnd(-2,2),vy:rnd(-3,-1),t:0});P.lvl=Math.max(0,P.lvl-3);P.parts=0;P.shield=0;P.respawn=90}
function boomAt(x,y,n,c){for(let i=0;i<n;i++){const a=rnd(0,6.3),s=rnd(.5,3.5);FX.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:rnd(15,40),c})}}
function damagePlanet(n){st.damage=Math.min(100,st.damage+n);S.dmg();st.flash=6;if(st.damage>=100)gameOver()}
function gameOver(){st.mode='over';st.t=0;if(st.score>hi){hi=st.score;localStorage.setItem('cd_hi',hi)}}
// spawning
const ETYPES=['dart','saucer','swirl','diver'];
function spawn(){const t=st.t,diff=st.planet*.25+st.stage*.15;
 if(t%Math.max(18,45-st.planet*4)==0){const k=ETYPES[(Math.random()*Math.min(4,2+st.planet))|0];const n=k=='dart'?4:1,x0=rnd(30,210);
  for(let i=0;i<n;i++)E.push({k,x:x0+(k=='dart'?(i-1.5)*18:0),y:-10-i*14,hp:k=='saucer'?3:1,t:i*8,vx:0,vy:k=='diver'?1.2:1+diff*.3,ph:rnd(0,6)})}
 if(t%70==35)R.push({x:rnd(20,220),y:-15,r:rnd(7,13),hp:3,rot:0,vr:rnd(-.05,.05),vy:rnd(.6,1.2),vx:rnd(-.3,.3),pts:[...Array(9)].map(()=>rnd(.7,1.1))})}
function enemyMove(e){e.t++;switch(e.k){case'dart':e.y+=e.vy*1.6;e.x+=Math.sin(e.t/15)*1.2;break;case'saucer':e.y+=e.vy*.6;e.x+=Math.sin(e.t/30+e.ph)*1.5;if(e.t%90==40)aim(e.x,e.y,2);break;
 case'swirl':e.y+=e.vy;e.x+=Math.cos(e.t/10+e.ph)*2.5;break;case'diver':if(e.t<50)e.y+=e.vy;else{e.vx+=(P.x-e.x)*.002;e.x+=e.vx;e.y+=3}if(e.t==50)aim(e.x,e.y,2.2);break}}
function aim(x,y,s){const a=Math.atan2(P.y-y,P.x-x);EB.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s})}
// bosses
function makeMid(){boss={x:120,y:-40,hp:60+st.planet*20,max:60+st.planet*20,t:0}}
function makeComet(){comet={y:-120,t:0,holes:[...Array(5)].map((_,i)=>({a:-2.6+i*.65*1.3,hp:12+st.planet*3,open:true})),c:COMETC[st.planet]};st.mode='comet';say('COMET APPROACHING '+PLANETS[st.planet][0]+'!',150)}
function makeCore(){st.mode='inside';st.t=0;E=[];EB=[];R=[];st.descend=0;core={targets:[...Array(10)].map((_,i)=>({x:36+(i%5)*42,y:70+((i/5)|0)*50,hp:6,ph:i*37,dead:false})),c:comet.c};say('INSIDE THE COMET! DESTROY THE CORE',150)}
function bomb(){if(st.bombs<=0||!P.alive)return;st.bombs--;S.bomb();st.flash=20;st.shake=15;
 E.forEach(e=>{boomAt(e.x,e.y,10,'#fa0');st.score+=100});E=[];EB=[];R.forEach(r=>{PT.push({x:r.x,y:r.y,vx:0,vy:-1,t:0})});R=[];
 if(boss)boss.hp-=20;if(comet&&st.mode=='comet')comet.holes.forEach(h=>h.open&&(h.hp-=4));if(core)core.targets.forEach(t=>!t.dead&&(t.hp-=2))}
// update
function hitTest(b,x,y,r){return Math.abs(b.x-x)<r&&Math.abs(b.y-y)<r+4}
function update(){st.t++;if(st.msgT)st.msgT--;if(st.flash)st.flash--;if(st.shake)st.shake--;
 const sp=st.mode=='inside'?4:1.5;stars.forEach(s=>{s.y+=s.s*sp;if(s.y>H){s.y=0;s.x=Math.random()*W}});
 FX=FX.filter(f=>(f.x+=f.vx,f.y+=f.vy,f.vx*=.95,f.vy*=.95,--f.t>0));
 if(!['play','comet','inside'].includes(st.mode))return;
 // player
 if(P.alive){if(K.ArrowLeft)P.x-=3;if(K.ArrowRight)P.x+=3;if(K.ArrowUp)P.y-=3;if(K.ArrowDown)P.y+=3;P.x=Math.max(10,Math.min(W-10,P.x));P.y=Math.max(40,Math.min(H-20,P.y));
  if(--P.fireT<=0){fire();P.fireT=P.lvl>=5?5:7}if(P.inv)P.inv--}
 else if(--P.respawn<=0){if(st.lives<0){gameOver();return}P.alive=true;P.inv=150;P.x=120;P.y=340}
 if(bombReq){bomb();bombReq=false}
 // bullets
 B=B.filter(b=>{if(b.k=='hom'){let tg=null,bd=1e9;for(const e of E){const d=Math.hypot(e.x-b.x,e.y-b.y);if(d<bd){bd=d;tg=e}}if(tg){b.vx+=(tg.x-b.x)/bd*.6;b.vy+=(tg.y-b.y)/bd*.6}else b.vy-=.3;const s=Math.hypot(b.vx,b.vy);if(s>6){b.vx*=6/s;b.vy*=6/s}}b.x+=b.vx;b.y+=b.vy;return b.y>-10&&b.y<H+10&&b.x>-10&&b.x<W+10&&!b.dead});
 EB=EB.filter(b=>{b.x+=b.vx;b.y+=b.vy;if(P.alive&&Math.hypot(b.x-P.x,b.y-P.y)<(P.shield?12:5)){playerHit();return false}return b.y<H+5&&b.y>-5&&b.x>-5&&b.x<W+5});
 PT=PT.filter(p=>{p.t++;p.vy+=.04;p.vy=Math.min(p.vy,1.5);p.vx*=.97;p.x+=p.vx;p.y+=p.vy;if(P.alive&&Math.hypot(p.x-P.x,p.y-P.y)<16){collect();return false}return p.y<H+10});
 if(st.mode=='play'){const len=1500+st.planet*150;
  if(st.t<len)spawn();if(st.stage==0&&st.t==len+60)makeMid();if(st.stage==1&&st.t==len+90)makeComet();
  if(st.stage==0&&st.t>len&&!boss&&E.length==0&&st.t>len+120)stageClear()}
 if(st.mode=='comet'&&st.t%120==0)spawn(),spawn();
 if(st.mode=='inside'&&st.t%80==0)E.push({k:'swirl',x:rnd(30,210),y:-10,hp:1,t:0,vx:0,vy:1.5,ph:rnd(0,6)});
 // enemies
 E=E.filter(e=>{enemyMove(e);for(const b of B)if(!b.dead&&hitTest(b,e.x,e.y,8)){if(b.k!='laser')b.dead=1;e.hp-=b.d;if(e.hp<=0){boomAt(e.x,e.y,14,'#fa4');S.boom();st.score+=e.k=='saucer'?300:100;if(Math.random()<.12)PT.push({x:e.x,y:e.y,vx:0,vy:-1,t:0});return false}}
  if(P.alive&&Math.hypot(e.x-P.x,e.y-P.y)<10){playerHit();boomAt(e.x,e.y,10,'#fa4');return false}
  if(e.y>H+10){if(st.mode!='inside')damagePlanet(1);return false}return e.x>-30&&e.x<W+30});
 R=R.filter(r=>{r.y+=r.vy;r.x+=r.vx;r.rot+=r.vr;for(const b of B)if(!b.dead&&Math.hypot(b.x-r.x,b.y-r.y)<r.r+2){if(b.k!='laser')b.dead=1;r.hp-=b.d;S.hit();if(r.hp<=0){boomAt(r.x,r.y,16,'#a98');S.boom();st.score+=150;const n=r.r>11?2:1;for(let i=0;i<n;i++)PT.push({x:r.x,y:r.y,vx:rnd(-1,1),vy:-1.5,t:0});return false}}
  if(P.alive&&Math.hypot(r.x-P.x,r.y-P.y)<r.r+4)playerHit();return r.y<H+20});
 if(boss)updBoss();if(comet&&st.mode=='comet')updComet();if(core)updCore()}
function updBoss(){const b=boss;b.t++;b.y+=(70-b.y)*.02;b.x=120+Math.sin(b.t/60)*70;
 if(b.t%50==0)for(let i=-2;i<=2;i++)EB.push({x:b.x,y:b.y+14,vx:i*.7,vy:2.2});if(b.t%80==40)aim(b.x-20,b.y,2.5),aim(b.x+20,b.y,2.5);
 if(b.t%150==0)E.push({k:'diver',x:b.x,y:b.y,hp:1,t:0,vx:0,vy:1.2,ph:0});
 for(const s of B)if(!s.dead&&Math.abs(s.x-b.x)<26&&Math.abs(s.y-b.y)<14){if(s.k!='laser')s.dead=1;b.hp-=s.d;st.flash=st.flash||1;S.hit()}
 if(b.hp<=0){boomAt(b.x,b.y,80,'#ff6');S.big();st.shake=25;st.score+=5000;for(let i=0;i<3;i++)PT.push({x:b.x,y:b.y,vx:rnd(-1.5,1.5),vy:-2,t:0});boss=null;say('MID BOSS DESTROYED!')}}
function cometXY(h){return[120+Math.cos(h.a)*58,comet.y+Math.sin(h.a)*-34*-1+10]}
function updComet(){const c=comet;c.t++;c.y=Math.min(110,c.y+.6);if(c.t>200)c.y+=.03;
 if(c.y>300){damagePlanet(100);return}
 c.holes.forEach((h,i)=>{if(!h.open)return;const hx=120+(i-2)*34,hy=c.y+28+Math.abs(i-2)*-6;h.x=hx;h.y=hy;
  if((c.t+i*30)%110==0)aim(hx,hy,2.3);if((c.t+i*45)%200==0)R.push({x:hx,y:hy,r:9,hp:3,rot:0,vr:.05,vy:1.3,vx:rnd(-.5,.5),pts:[...Array(9)].map(()=>rnd(.7,1.1))});
  for(const s of B)if(!s.dead&&Math.abs(s.x-hx)<10&&Math.abs(s.y-hy)<10){if(s.k!='laser')s.dead=1;h.hp-=s.d;S.hit();if(h.hp<=0){h.open=false;boomAt(hx,hy,40,c.c);S.big();st.score+=2000;st.shake=10}}
  for(const s of B)if(!s.dead&&s.vy<0&&Math.hypot(s.x-120,(s.y-c.y)*1.6)<62)s.dead=1});
 if(c.holes.every(h=>!h.open)){say('ENTER THE COMET!',90);makeCore()}}
function updCore(){st.descend++;const left=core.targets.filter(t=>!t.dead).length;
 if(st.descend>60*60){damagePlanet(100);return}
 core.targets.forEach(t=>{if(t.dead)return;t.open=((st.t+t.ph)%160)<80;if(t.open&&(st.t+t.ph)%60==0)aim(t.x,t.y,2.4);
  for(const s of B)if(!s.dead&&Math.abs(s.x-t.x)<11&&Math.abs(s.y-t.y)<11){s.dead=1;if(t.open){t.hp-=s.d;S.hit();if(t.hp<=0){t.dead=true;boomAt(t.x,t.y,30,core.c);S.boom();st.score+=1000}}}});
 if(left==0){boomAt(120,120,150,'#fff');S.big();st.flash=40;st.shake=40;st.score+=10000;stageClear()}}
function stageClear(){st.mode='bonus';st.t=0;const fin=st.stage==1;st.bonus=Math.round((100-st.damage)*(fin?500:100));st.score+=st.bonus;st.bombs=Math.min(5,st.bombs+1);if(st.score>hi){hi=st.score;localStorage.setItem('cd_hi',hi)}}
// drawing
function px(x,y,w,h,c){g.fillStyle=c;g.fillRect(x|0,y|0,w,h)}
function drawShip(x,y){const l=P.lvl,fl=st.t%4<2;
 // engine flame
 px(x-2,y+8,4,fl?5:3,'#f80');px(x-1,y+8,2,fl?7:4,'#ff6');
 // wings get bigger with level
 const ww=l>=2?11:8;px(x-ww,y+2,ww*2,4,'#9ab');px(x-ww,y+4,2,4,'#f44');px(x+ww-2,y+4,2,4,'#f44');
 px(x-3,y-8,6,16,'#dde');px(x-1,y-11,2,4,'#fff');px(x-2,y-4,4,4,'#3cf');
 if(l>=1){px(x-6,y-6,2,6,'#fc4');px(x+4,y-6,2,6,'#fc4')}
 if(l>=2){px(x-ww-1,y-1,3,4,'#6f6');px(x+ww-2,y-1,3,4,'#6f6')}
 if(l>=3){for(const s of[-1,1]){const pxx=x+s*16,py=y+6+Math.sin(st.t/8)*2;g.fillStyle='#f6c';g.beginPath();g.arc(pxx,py,4,0,7);g.fill();px(pxx-1,py-2,2,2,'#fff');px(x+s*(ww),y+4,s*(16-ww),1,'#555')}}
 if(l>=4){px(x-3,y+6,6,4,'#c84');px(x-1,y+10,2,3,'#fa6')}
 if(l>=5){px(x-1,y-14,2,4,st.t%6<3?'#0ff':'#fff')}
 if(l>=7){px(x-10,y,3,6,'#f60');px(x+7,y,3,6,'#f60')}
 if(P.shield>0){g.strokeStyle=`rgba(100,200,255,${.4+.15*P.shield+.2*Math.sin(st.t/4)})`;g.lineWidth=1+P.shield*.5;g.beginPath();g.arc(x,y,15,0,7);g.stroke()}}
function drawEnemy(e){const x=e.x|0,y=e.y|0,f=st.t%20<10;switch(e.k){
 case'dart':px(x-5,y-3,10,3,'#f44');px(x-2,y,4,5,'#fa4');px(x-6,y-6,2,4,'#c22');px(x+4,y-6,2,4,'#c22');break;
 case'saucer':px(x-9,y-1,18,4,'#8f8');px(x-5,y-5,10,4,'#cfc');px(x-11,y+1,22,2,'#494');for(let i=-8;i<=8;i+=4)px(x+i,y+1,2,1,f?'#ff0':'#f00');break;
 case'swirl':g.fillStyle='#c6f';g.beginPath();g.arc(x,y,5,0,7);g.fill();px(x-7+(f?0:1),y-1,14,2,'#fff');break;
 case'diver':px(x-2,y-6,4,12,'#fd4');px(x-7,y-2,14,3,'#a80');px(x-1,y+6,2,2,'#f00');break}}
function drawRock(r){g.save();g.translate(r.x,r.y);g.rotate(r.rot);g.fillStyle='#7a6a5a';g.beginPath();r.pts.forEach((p,i)=>{const a=i/9*6.283;g.lineTo(Math.cos(a)*r.r*p,Math.sin(a)*r.r*p)});g.fill();g.fillStyle='#544';g.fillRect(-r.r/3,-r.r/4,3,3);g.fillRect(r.r/5,r.r/6,2,2);g.restore()}
function drawPart(p){const f=(st.t>>3)%2;g.fillStyle=f?'#ff0':'#f80';g.beginPath();g.moveTo(p.x,p.y-6);g.lineTo(p.x+5,p.y);g.lineTo(p.x,p.y+6);g.lineTo(p.x-5,p.y);g.fill();px(p.x-1,p.y-2,2,4,'#fff');g.fillStyle='#000';g.font='5px monospace';g.fillText('P',p.x-1.5,p.y+2)}
function drawPlanet(){const p=PLANETS[st.planet];const y=H+70-(st.mode=='inside'?0:0);g.fillStyle=p[1];g.beginPath();g.arc(120,y,110,0,7);g.fill();g.fillStyle=p[2];for(let i=0;i<6;i++){g.fillRect(40+((i*53+st.t*.1)%160),y-90+i*12,30,5)}if(st.planet==3){g.strokeStyle='#cb8';g.lineWidth=3;g.beginPath();g.ellipse(120,y-10,160,20,0,3.3,6.1);g.stroke()}
 if(st.flash&&st.mode!='bonus'){g.fillStyle='rgba(255,0,0,.25)';g.fillRect(0,H-50,W,50)}}
function drawComet(){const c=comet;g.save();for(let i=0;i<30;i++){g.fillStyle=`rgba(255,255,255,${.04})`;g.beginPath();g.arc(120+Math.sin(i+st.t/20)*8,c.y-60-i*8,60-i,0,7);g.fill()}
 g.fillStyle=c.c;g.beginPath();g.ellipse(120,c.y,70,46,0,0,7);g.fill();g.fillStyle='rgba(0,0,0,.25)';for(let i=0;i<8;i++){g.beginPath();g.arc(120+Math.cos(i*2.1)*40,c.y+Math.sin(i*1.7)*25,6+i%3*3,0,7);g.fill()}
 c.holes.forEach(h=>{if(h.x==null)return;if(h.open){g.fillStyle='#000';g.beginPath();g.arc(h.x,h.y,8,0,7);g.fill();g.fillStyle=st.t%10<5?'#f00':'#f80';g.beginPath();g.arc(h.x,h.y,3+h.hp/10,0,7);g.fill()}else{px(h.x-4,h.y-1,8,2,'#333')}});g.restore()}
function drawCore(){const c=core;g.fillStyle='#100818';g.fillRect(0,0,W,H);
 for(let i=0;i<12;i++){const y=((i*40+st.t*4)%440)-40;g.fillStyle=c.c;g.globalAlpha=.25;g.fillRect(0,y,18+Math.sin(i)*6,30);g.fillRect(W-22-Math.cos(i)*6,y,24,30);g.globalAlpha=1}
 px(10,30,220,130,'#223');px(12,32,216,126,'#112');for(let i=0;i<20;i++)px(14+i*11,150,6,4,(st.t>>2)%20==i?'#0f0':'#050');
 c.targets.forEach(t=>{if(t.dead){px(t.x-8,t.y-8,16,16,'#311');return}px(t.x-10,t.y-10,20,20,'#556');if(t.open){px(t.x-7,t.y-7,14,14,st.t%8<4?'#f22':'#ff0');px(t.x-2,t.y-2,4,4,'#fff')}else{px(t.x-8,t.y-8,16,7,'#889');px(t.x-8,t.y+1,16,7,'#889')}})}
function text(s,x,y,c='#fff',sz=8,al='center'){g.font=`bold ${sz}px monospace`;g.textAlign=al;g.fillStyle='#000';g.fillText(s,x+1,y+1);g.fillStyle=c;g.fillText(s,x,y)}
function draw(){g.save();if(st.shake)g.translate(rnd(-3,3),rnd(-3,3));g.fillStyle='#000';g.fillRect(-5,-5,W+10,H+10);
 if(st.mode=='inside'&&core)drawCore();else stars.forEach(s=>px(s.x,s.y,s.s>1.5?2:1,s.s>1.5?2:1,s.s>1.5?'#fff':'#668'));
 if(st.mode=='title'){drawTitle();g.restore();return}
 if(st.mode!='inside')drawPlanet();if(comet&&st.mode=='comet')drawComet();
 if(boss){const b=boss,x=b.x,y=b.y;px(x-28,y-6,56,12,'#668');px(x-18,y-14,36,8,'#99b');px(x-6,y-20,12,6,'#f44');px(x-30,y+4,8,10,'#445');px(x+22,y+4,8,10,'#445');px(x-4,y+6,8,8,st.t%10<5?'#ff0':'#f60');px(x-28,y-24,56*b.hp/b.max,2,'#f00')}
 R.forEach(drawRock);E.forEach(drawEnemy);PT.forEach(drawPart);
 B.forEach(b=>{if(b.k=='laser')px(b.x-1,b.y-8,3,14,'#0ff');else if(b.k=='hom')px(b.x-1,b.y-1,3,3,'#f60');else if(b.k=='pod')px(b.x-1,b.y-3,2,6,'#f6c');else px(b.x-1,b.y-3,2,6,'#ff8')});
 EB.forEach(b=>{px(b.x-2,b.y-2,4,4,st.t%6<3?'#f0f':'#fff')});
 if(P.alive&&!(P.inv&&st.t%6<2))drawShip(P.x|0,P.y|0);
 FX.forEach(f=>px(f.x,f.y,2,2,f.c));
 if(st.flash>10){g.fillStyle=`rgba(255,255,255,${st.flash/60})`;g.fillRect(0,0,W,H)}
 hud();g.restore()}
function hud(){text('SCORE '+st.score,4,10,'#fff',8,'left');text('HI '+hi,W-4,10,'#ff0',8,'right');
 const p=PLANETS[st.planet];text(p[0]+' '+(st.stage+1),4,20,p[1],7,'left');
 px(W-64,15,60,6,'#300');px(W-64,15,60*st.damage/100,6,st.damage>70?'#f00':'#fa0');text('DMG '+st.damage+'%',W-66,21,'#fff',7,'right');
 for(let i=0;i<Math.max(0,st.lives);i++)px(4+i*8,H-10,5,7,'#dde');
 text('PWR: '+UPG[P.lvl],4,H-16,'#6f6',7,'left');for(let i=0;i<8;i++)px(4+i*6,H-26,5,4,i<P.lvl?'#6f6':'#232');
 if(st.mode=='inside'){const s=Math.max(0,60-(st.descend/60|0));text('COMET IMPACT IN '+s,120,32,s<15?'#f44':'#fff',8)}
 // bomb button
 g.globalAlpha=.6;g.fillStyle='#a00';g.beginPath();g.arc(212,372,20,0,7);g.fill();g.globalAlpha=1;text('B',212,370,'#fff',10);text('x'+st.bombs,212,382,'#ff0',7);
 if(st.msgT&&(st.msgT>30||st.t%8<5))text(st.msg,120,170,'#ff0',9);
 if(st.mode=='bonus'){text(st.stage==1?'COMET DESTROYED!':'STAGE CLEAR',120,150,'#0ff',12);text('PLANET DAMAGE '+st.damage+'%',120,180,'#fff',9);text('BONUS '+st.bonus,120,198,'#ff0',10);if(st.t>90&&st.t%40<28)text('TAP TO CONTINUE',120,240,'#fff',8)}
 if(st.mode=='over'){text('GAME OVER',120,170,'#f44',16);text(st.damage>=100?PLANETS[st.planet][0]+' WAS DESTROYED':'',120,192,'#fa0',8);if(st.t>60&&st.t%40<28)text('TAP TO RETURN',120,230,'#fff',8)}}
function drawTitle(){const t=st.t;g.fillStyle='#3a7bff';g.beginPath();g.arc(120,H+60,110,0,7);g.fill();
 for(let i=0;i<20;i++){g.fillStyle=`rgba(150,220,255,${.05})`;g.beginPath();g.arc(170-i*3,60-i*6,30-i,0,7);g.fill()}g.fillStyle='#6cf';g.beginPath();g.arc(170,60,14,0,7);g.fill();
 text('COMET',120,130,'#fc4',28);text('DEFENDER',120,160,'#f84',22);text('DEFEND THE SOLAR SYSTEM',120,185,'#aaf',8);
 text('SHOOT ROCKS, GRAB PARTS',120,215,'#ff0',8);text('BUILD UP YOUR WEAPONS',120,227,'#ff0',8);
 P.lvl=Math.min(8,(t/40|0)%9);drawShip(120,262);text(UPG[P.lvl],120,290,'#6f6',8);
 if(t%40<28)text('TAP TO START',120,320,'#fff',10);text('DRAG TO MOVE  B = BOMB',120,336,'#888',7);text('HI SCORE '+hi,120,20,'#ff0',9)}
let last=0,acc=0;function loop(ts){acc+=Math.min(100,ts-last);last=ts;while(acc>=16.67){update();acc-=16.67}draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
window.__cd={st,P,startGame,makeComet,makeCore,collect};
