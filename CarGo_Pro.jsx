const { useState, useEffect, useRef } = React;

// ─── CANVAS SIZE & ARENA BOUNDS ──────────────────────────────────────────────
const W = window.innerWidth, H = window.innerHeight;
const BL = 40, BR = W - 40, BT = 40, BB = H - 40;
const MAX_LIVES = 3;
const INV_FRAMES = 150;
const SHAKE_HIT = 8, SHAKE_WALL = 5;
const FONT_TITLE = "Orbitron, 'Courier New', monospace";
const FONT_UI    = "Rajdhani, 'Segoe UI', monospace";

// ─── CAR TIERS ───────────────────────────────────────────────────────────────
const TIERS = [
  { name:"Hatchback",  minC:0,  maxV:1.8,  acc:0.055, trn:0.050, scale:0.70, paint:"#5B9BD5", shine:"#A8D1F5", dark:"#2E6EA6", glass:"#C5E8FF" },
  { name:"Sedan",      minC:4,  maxV:2.8,  acc:0.070, trn:0.046, scale:0.75, paint:"#E85D5D", shine:"#F5A0A0", dark:"#B02020", glass:"#FFE0C5" },
  { name:"Sports Car", minC:10, maxV:4.5,  acc:0.100, trn:0.054, scale:0.80, paint:"#2ECC71", shine:"#88F5B8", dark:"#1A7A44", glass:"#C5FFDE" },
  { name:"Supercar",   minC:18, maxV:7.0,  acc:0.150, trn:0.060, scale:0.85, paint:"#F39C12", shine:"#FFDFA0", dark:"#8A5500", glass:"#FFF5C5" },
];

// ─── POWER-UPS ───────────────────────────────────────────────────────────────
const PUPS = [
  { t:"nitro",  color:"#00c8ff", glow:"#0088cc", label:"⚡", desc:"NITRO"  },
  { t:"shield", color:"#44ff99", glow:"#00aa55", label:"🛡", desc:"SHIELD" },
  { t:"magnet", color:"#ffdd44", glow:"#cc9900", label:"🧲", desc:"MAGNET" },
];

const rnd = (a,b) => Math.random()*(b-a)+a;
const clamp = (v,lo,hi) => Math.max(lo,Math.min(hi,v));
const getTierIdx = c => { let t=0; TIERS.forEach((ti,i)=>{ if(c>=ti.minC) t=i; }); return t; };

// ─── CAR DRAWING ─────────────────────────────────────────────────────────────
function drawEmojiCar(ctx, x, y, angle, tierIdx) {
  const T = TIERS[tierIdx];
  const s = T.scale * 22;
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(angle + Math.PI/2);

  if (tierIdx===0) {
    const bw=s*1.5,bh=s*2.4;
    ctx.save();ctx.translate(3,4);ctx.globalAlpha=0.28;ctx.fillStyle="#000";ctx.beginPath();ctx.ellipse(0,0,bw*.72,bh*.48,0,0,Math.PI*2);ctx.fill();ctx.restore();
    const bg=ctx.createLinearGradient(-bw*.6,-bh*.5,bw*.6,bh*.5);bg.addColorStop(0,T.shine);bg.addColorStop(0.5,T.paint);bg.addColorStop(1,T.dark);
    ctx.fillStyle=bg;ctx.beginPath();ctx.moveTo(-bw*.55,bh*.3);ctx.bezierCurveTo(-bw*.65,bh*.4,-bw*.65,bh*.5,-bw*.45,bh*.52);ctx.lineTo(bw*.45,bh*.52);ctx.bezierCurveTo(bw*.65,bh*.5,bw*.65,bh*.4,bw*.55,bh*.3);ctx.lineTo(bw*.55,-bh*.3);ctx.bezierCurveTo(bw*.65,-bh*.4,bw*.65,-bh*.5,bw*.45,-bh*.52);ctx.lineTo(-bw*.45,-bh*.52);ctx.bezierCurveTo(-bw*.65,-bh*.5,-bw*.65,-bh*.4,-bw*.55,-bh*.3);ctx.closePath();ctx.fill();
    ctx.strokeStyle=T.dark;ctx.lineWidth=1.2;ctx.stroke();
    const cg=ctx.createLinearGradient(0,-bh*.42,0,bh*.04);cg.addColorStop(0,"#222");cg.addColorStop(1,T.dark+"cc");
    ctx.fillStyle=cg;ctx.beginPath();ctx.moveTo(-bw*.35,-bh*.02);ctx.bezierCurveTo(-bw*.4,-bh*.24,-bw*.32,-bh*.38,-bw*.18,-bh*.40);ctx.lineTo(bw*.18,-bh*.40);ctx.bezierCurveTo(bw*.32,-bh*.38,bw*.4,-bh*.24,bw*.35,-bh*.02);ctx.closePath();ctx.fill();
    ctx.fillStyle=T.glass;ctx.globalAlpha=0.88;ctx.beginPath();ctx.moveTo(-bw*.30,-bh*.06);ctx.bezierCurveTo(-bw*.34,-bh*.22,-bw*.26,-bh*.34,-bw*.14,-bh*.36);ctx.lineTo(bw*.14,-bh*.36);ctx.bezierCurveTo(bw*.26,-bh*.34,bw*.34,-bh*.22,bw*.30,-bh*.06);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle=T.glass;ctx.globalAlpha=0.60;ctx.beginPath();ctx.roundRect(-bw*.28,bh*.08,bw*.56,bh*.18,3);ctx.fill();ctx.globalAlpha=1;
    [[-bw*.38,-bh*.47],[bw*.38,-bh*.47]].forEach(([lx,ly])=>{const g2=ctx.createRadialGradient(lx,ly,0,lx,ly,s*.32);g2.addColorStop(0,"#ffffc0");g2.addColorStop(0.5,"#ffee88");g2.addColorStop(1,T.paint);ctx.fillStyle=g2;ctx.beginPath();ctx.ellipse(lx,ly,s*.22,s*.14,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff8";ctx.lineWidth=0.8;ctx.stroke();});
    [[-bw*.38,bh*.46],[bw*.38,bh*.46]].forEach(([lx,ly])=>{ctx.fillStyle="#ff2200cc";ctx.beginPath();ctx.ellipse(lx,ly,s*.2,s*.12,0,0,Math.PI*2);ctx.fill();});
    [[-bw*.6,-bh*.32],[bw*.6,-bh*.32],[-bw*.6,bh*.32],[bw*.6,bh*.32]].forEach(([wx,wy])=>{ctx.fillStyle="#111";ctx.beginPath();ctx.ellipse(wx,wy,s*.22,s*.26,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#555";ctx.beginPath();ctx.ellipse(wx,wy,s*.13,s*.16,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#aaa";ctx.beginPath();ctx.arc(wx,wy,s*.05,0,Math.PI*2);ctx.fill();});
  } else if (tierIdx===1) {
    const bw=s*1.6,bh=s*2.7;
    ctx.save();ctx.translate(3,4);ctx.globalAlpha=0.30;ctx.fillStyle="#000";ctx.beginPath();ctx.ellipse(0,0,bw*.74,bh*.48,0,0,Math.PI*2);ctx.fill();ctx.restore();
    const bg=ctx.createLinearGradient(-bw*.6,-bh*.5,bw*.6,bh*.5);bg.addColorStop(0,T.shine);bg.addColorStop(0.45,T.paint);bg.addColorStop(1,T.dark);
    ctx.fillStyle=bg;ctx.beginPath();ctx.moveTo(-bw*.5,bh*.36);ctx.bezierCurveTo(-bw*.72,bh*.42,-bw*.7,bh*.52,-bw*.44,bh*.54);ctx.lineTo(bw*.44,bh*.54);ctx.bezierCurveTo(bw*.7,bh*.52,bw*.72,bh*.42,bw*.5,bh*.36);ctx.lineTo(bw*.55,-bh*.22);ctx.bezierCurveTo(bw*.72,-bh*.38,bw*.65,-bh*.54,bw*.40,-bh*.56);ctx.lineTo(-bw*.40,-bh*.56);ctx.bezierCurveTo(-bw*.65,-bh*.54,-bw*.72,-bh*.38,-bw*.55,-bh*.22);ctx.closePath();ctx.fill();
    ctx.strokeStyle=T.dark;ctx.lineWidth=1.4;ctx.stroke();
    const cg=ctx.createLinearGradient(0,-bh*.42,0,bh*.04);cg.addColorStop(0,"#222");cg.addColorStop(1,T.dark+"cc");
    ctx.fillStyle=cg;ctx.beginPath();ctx.moveTo(-bw*.38,bh*.04);ctx.bezierCurveTo(-bw*.44,-bh*.1,-bw*.38,-bh*.38,-bw*.2,-bh*.42);ctx.lineTo(bw*.2,-bh*.42);ctx.bezierCurveTo(bw*.38,-bh*.38,bw*.44,-bh*.1,bw*.38,bh*.04);ctx.closePath();ctx.fill();
    ctx.fillStyle=T.glass;ctx.globalAlpha=0.90;ctx.beginPath();ctx.moveTo(-bw*.32,-bh*.02);ctx.bezierCurveTo(-bw*.37,-bh*.2,-bw*.30,-bh*.36,-bw*.16,-bh*.38);ctx.lineTo(bw*.16,-bh*.38);ctx.bezierCurveTo(bw*.30,-bh*.36,bw*.37,-bh*.2,bw*.32,-bh*.02);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle=T.glass;ctx.globalAlpha=0.60;ctx.beginPath();ctx.roundRect(-bw*.44,-bh*.1,bw*.12,bh*.24,3);ctx.fill();ctx.beginPath();ctx.roundRect(bw*.32,-bh*.1,bw*.12,bh*.24,3);ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle=T.glass;ctx.globalAlpha=0.55;ctx.beginPath();ctx.moveTo(-bw*.30,bh*.06);ctx.lineTo(bw*.30,bh*.06);ctx.lineTo(bw*.28,bh*.22);ctx.lineTo(-bw*.28,bh*.22);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
    [[-bw*.35,-bh*.50],[bw*.35,-bh*.50]].forEach(([lx,ly])=>{const g2=ctx.createRadialGradient(lx,ly,0,lx,ly,s*.36);g2.addColorStop(0,"#ffffff");g2.addColorStop(0.4,"#ffeeaa");g2.addColorStop(1,T.paint);ctx.fillStyle=g2;ctx.beginPath();ctx.roundRect(lx-s*.26,ly-s*.14,s*.52,s*.28,4);ctx.fill();});
    ctx.strokeStyle="rgba(255,255,200,0.7)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-bw*.26,-bh*.54);ctx.lineTo(bw*.26,-bh*.54);ctx.stroke();
    [[-bw*.35,bh*.50],[bw*.35,bh*.50]].forEach(([lx,ly])=>{ctx.fillStyle="#ff220088";ctx.beginPath();ctx.roundRect(lx-s*.24,ly-s*.1,s*.48,s*.2,3);ctx.fill();ctx.fillStyle="#ff4400cc";ctx.beginPath();ctx.roundRect(lx-s*.18,ly-s*.07,s*.36,s*.14,2);ctx.fill();});
    [[-bw*.66,-bh*.34],[bw*.66,-bh*.34],[-bw*.66,bh*.34],[bw*.66,bh*.34]].forEach(([wx,wy])=>{ctx.fillStyle="#0d0d1e";ctx.beginPath();ctx.ellipse(wx,wy,s*.24,s*.28,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#444";ctx.beginPath();ctx.ellipse(wx,wy,s*.15,s*.18,0,0,Math.PI*2);ctx.fill();for(let i=0;i<4;i++){const a=i*Math.PI/2;ctx.strokeStyle="#666";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(wx,wy);ctx.lineTo(wx+Math.cos(a)*s*.13,wy+Math.sin(a)*s*.13);ctx.stroke();}ctx.fillStyle="#999";ctx.beginPath();ctx.arc(wx,wy,s*.05,0,Math.PI*2);ctx.fill();});
  } else if (tierIdx===2) {
    const bw=s*1.55,bh=s*2.9;
    ctx.save();ctx.translate(4,5);ctx.globalAlpha=0.32;ctx.fillStyle="#000";ctx.beginPath();ctx.ellipse(0,0,bw*.72,bh*.46,0,0,Math.PI*2);ctx.fill();ctx.restore();
    const bg=ctx.createLinearGradient(-bw*.5,-bh*.5,bw*.5,bh*.5);bg.addColorStop(0,T.shine);bg.addColorStop(0.4,T.paint);bg.addColorStop(1,T.dark);
    ctx.fillStyle=bg;ctx.beginPath();ctx.moveTo(-bw*.38,bh*.42);ctx.bezierCurveTo(-bw*.70,bh*.50,-bw*.72,bh*.58,-bw*.42,bh*.58);ctx.lineTo(bw*.42,bh*.58);ctx.bezierCurveTo(bw*.72,bh*.58,bw*.70,bh*.50,bw*.38,bh*.42);ctx.lineTo(bw*.52,-bh*.02);ctx.bezierCurveTo(bw*.68,-bh*.18,bw*.62,-bh*.52,bw*.36,-bh*.58);ctx.lineTo(-bw*.36,-bh*.58);ctx.bezierCurveTo(-bw*.62,-bh*.52,-bw*.68,-bh*.18,-bw*.52,-bh*.02);ctx.closePath();ctx.fill();
    ctx.strokeStyle=T.dark;ctx.lineWidth=1.4;ctx.stroke();
    ctx.fillStyle=T.dark;ctx.fillRect(-bw*.48,bh*.50,bw*.96,s*.14);
    ctx.fillStyle=T.paint+"aa";ctx.fillRect(-bw*.42,bh*.48,bw*.84,s*.08);
    const cg=ctx.createLinearGradient(0,-bh*.44,0,bh*.02);cg.addColorStop(0,"#111");cg.addColorStop(1,T.dark);
    ctx.fillStyle=cg;ctx.beginPath();ctx.moveTo(-bw*.3,bh*.02);ctx.bezierCurveTo(-bw*.36,-bh*.12,-bw*.28,-bh*.38,-bw*.14,-bh*.44);ctx.lineTo(bw*.14,-bh*.44);ctx.bezierCurveTo(bw*.28,-bh*.38,bw*.36,-bh*.12,bw*.3,bh*.02);ctx.closePath();ctx.fill();
    ctx.fillStyle=T.glass;ctx.globalAlpha=0.88;ctx.beginPath();ctx.moveTo(-bw*.26,-bh*.02);ctx.bezierCurveTo(-bw*.32,-bh*.18,-bw*.24,-bh*.38,-bw*.11,-bh*.42);ctx.lineTo(bw*.11,-bh*.42);ctx.bezierCurveTo(bw*.24,-bh*.38,bw*.32,-bh*.18,bw*.26,-bh*.02);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
    [[-bw*.36,-bh*.52],[bw*.36,-bh*.52]].forEach(([lx,ly])=>{ctx.fillStyle="#ffffffdd";ctx.beginPath();ctx.moveTo(lx-s*.22,ly);ctx.lineTo(lx,ly-s*.16);ctx.lineTo(lx+s*.22,ly);ctx.lineTo(lx,ly+s*.1);ctx.closePath();ctx.fill();ctx.fillStyle="#88eeff99";ctx.beginPath();ctx.arc(lx,ly,s*.08,0,Math.PI*2);ctx.fill();});
    ctx.strokeStyle="rgba(200,255,255,0.85)";ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-bw*.28,-bh*.56);ctx.lineTo(bw*.28,-bh*.56);ctx.stroke();
    [[-bw*.38,bh*.52],[bw*.38,bh*.52]].forEach(([lx,ly])=>{ctx.fillStyle="#cc000099";ctx.beginPath();ctx.moveTo(lx-s*.2,ly);ctx.lineTo(lx,ly-s*.12);ctx.lineTo(lx+s*.2,ly);ctx.lineTo(lx,ly+s*.12);ctx.closePath();ctx.fill();ctx.fillStyle="#ff4400";ctx.beginPath();ctx.arc(lx,ly,s*.06,0,Math.PI*2);ctx.fill();});
    for(let i=0;i<3;i++){ctx.strokeStyle="rgba(0,0,0,0.35)";ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(-bw*.46,-bh*.06+i*s*.18);ctx.lineTo(-bw*.35,-bh*.06+i*s*.18);ctx.stroke();ctx.beginPath();ctx.moveTo(bw*.35,-bh*.06+i*s*.18);ctx.lineTo(bw*.46,-bh*.06+i*s*.18);ctx.stroke();}
    [[-bw*.68,-bh*.34],[bw*.68,-bh*.34],[-bw*.68,bh*.38],[bw*.68,bh*.38]].forEach(([wx,wy])=>{ctx.fillStyle="#0d0d1a";ctx.beginPath();ctx.ellipse(wx,wy,s*.27,s*.3,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#333";ctx.beginPath();ctx.ellipse(wx,wy,s*.16,s*.19,0,0,Math.PI*2);ctx.fill();for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ctx.strokeStyle="#555";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(wx+Math.cos(a)*s*.04,wy+Math.sin(a)*s*.04);ctx.lineTo(wx+Math.cos(a)*s*.14,wy+Math.sin(a)*s*.14);ctx.stroke();}ctx.fillStyle="#888";ctx.beginPath();ctx.arc(wx,wy,s*.05,0,Math.PI*2);ctx.fill();});
  } else {
    const bw=s*1.6,bh=s*3.1;
    ctx.save();ctx.translate(5,6);ctx.globalAlpha=0.36;ctx.fillStyle="#000";ctx.beginPath();ctx.ellipse(0,0,bw*.72,bh*.46,0,0,Math.PI*2);ctx.fill();ctx.restore();
    const bg=ctx.createLinearGradient(-bw*.5,-bh*.5,bw*.5,bh*.5);bg.addColorStop(0,"#fff8e1");bg.addColorStop(0.3,T.shine);bg.addColorStop(0.6,T.paint);bg.addColorStop(1,T.dark);
    ctx.fillStyle=bg;ctx.beginPath();ctx.moveTo(-bw*.32,bh*.46);ctx.bezierCurveTo(-bw*.65,bh*.52,-bw*.68,bh*.60,-bw*.38,bh*.62);ctx.lineTo(bw*.38,bh*.62);ctx.bezierCurveTo(bw*.68,bh*.60,bw*.65,bh*.52,bw*.32,bh*.46);ctx.lineTo(bw*.52,bh*.02);ctx.bezierCurveTo(bw*.70,-bh*.12,bw*.70,-bh*.44,bw*.38,-bh*.60);ctx.lineTo(-bw*.38,-bh*.60);ctx.bezierCurveTo(-bw*.70,-bh*.44,-bw*.70,-bh*.12,-bw*.52,bh*.02);ctx.closePath();ctx.fill();
    ctx.strokeStyle=T.dark;ctx.lineWidth=1.6;ctx.stroke();
    ctx.fillStyle="rgba(0,0,0,0.12)";for(let i=-2;i<3;i++){ctx.beginPath();ctx.moveTo(i*s*.28-s*.08,-bh*.62);ctx.lineTo(i*s*.28+s*.08,-bh*.62);ctx.lineTo(i*s*.28+s*.08,bh*.62);ctx.lineTo(i*s*.28-s*.08,bh*.62);ctx.fill();}
    const sg=ctx.createLinearGradient(-bw*.72,bh*.54,bw*.72,bh*.54);sg.addColorStop(0,T.dark);sg.addColorStop(0.5,T.paint);sg.addColorStop(1,T.dark);
    ctx.fillStyle=sg;ctx.beginPath();ctx.roundRect(-bw*.72,bh*.52,bw*1.44,s*.2,4);ctx.fill();ctx.strokeStyle=T.dark+"cc";ctx.lineWidth=1.2;ctx.stroke();
    const cg=ctx.createLinearGradient(0,-bh*.48,0,bh*.04);cg.addColorStop(0,"#080810");cg.addColorStop(1,"#1a1a30");
    ctx.fillStyle=cg;ctx.beginPath();ctx.moveTo(-bw*.28,bh*.04);ctx.bezierCurveTo(-bw*.34,-bh*.1,-bw*.26,-bh*.4,-bw*.12,-bh*.46);ctx.lineTo(bw*.12,-bh*.46);ctx.bezierCurveTo(bw*.26,-bh*.4,bw*.34,-bh*.1,bw*.28,bh*.04);ctx.closePath();ctx.fill();
    ctx.fillStyle=T.glass;ctx.globalAlpha=0.92;ctx.beginPath();ctx.moveTo(-bw*.24,-bh*.0);ctx.bezierCurveTo(-bw*.30,-bh*.18,-bw*.22,-bh*.40,-bw*.10,-bh*.44);ctx.lineTo(bw*.10,-bh*.44);ctx.bezierCurveTo(bw*.22,-bh*.40,bw*.30,-bh*.18,bw*.24,-bh*.0);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
    [[-bw*.34,-bh*.52],[bw*.34,-bh*.52],[-bw*.22,-bh*.54],[bw*.22,-bh*.54]].forEach(([lx,ly],i)=>{const g2=ctx.createRadialGradient(lx,ly,0,lx,ly,s*(i<2?.22:.14));g2.addColorStop(0,"#ffffff");g2.addColorStop(0.5,i>=2?"#aaffff":"#ffffcc");g2.addColorStop(1,T.paint+"00");ctx.fillStyle=g2;ctx.beginPath();ctx.arc(lx,ly,s*(i<2?.22:.14),0,Math.PI*2);ctx.fill();});
    ctx.save();ctx.shadowBlur=8;ctx.shadowColor="rgba(255,255,200,0.9)";ctx.strokeStyle="rgba(255,255,200,0.95)";ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-bw*.42,-bh*.57);ctx.lineTo(-bw*.15,-bh*.57);ctx.stroke();ctx.beginPath();ctx.moveTo(bw*.15,-bh*.57);ctx.lineTo(bw*.42,-bh*.57);ctx.stroke();ctx.restore();
    [[-bw*.34,bh*.54],[bw*.34,bh*.54]].forEach(([lx,ly])=>{ctx.fillStyle="#ff000066";ctx.beginPath();ctx.roundRect(lx-s*.22,ly-s*.1,s*.44,s*.2,3);ctx.fill();ctx.fillStyle="#ff3300cc";ctx.beginPath();ctx.roundRect(lx-s*.14,ly-s*.06,s*.28,s*.12,2);ctx.fill();});
    ctx.save();ctx.shadowBlur=6;ctx.shadowColor="#ff2200";ctx.strokeStyle="rgba(255,60,0,0.8)";ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(-bw*.44,bh*.56);ctx.lineTo(-bw*.12,bh*.56);ctx.stroke();ctx.beginPath();ctx.moveTo(bw*.12,bh*.56);ctx.lineTo(bw*.44,bh*.56);ctx.stroke();ctx.restore();
    [[-bw*.70,-bh*.36],[bw*.70,-bh*.36],[-bw*.70,bh*.40],[bw*.70,bh*.40]].forEach(([wx,wy])=>{ctx.fillStyle="#080810";ctx.beginPath();ctx.ellipse(wx,wy,s*.3,s*.34,0,0,Math.PI*2);ctx.fill();const tg=ctx.createRadialGradient(wx-s*.06,wy-s*.06,0,wx,wy,s*.2);tg.addColorStop(0,"#5a5a5a");tg.addColorStop(1,"#222");ctx.fillStyle=tg;ctx.beginPath();ctx.ellipse(wx,wy,s*.19,s*.22,0,0,Math.PI*2);ctx.fill();for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.strokeStyle="#666";ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(wx+Math.cos(a)*s*.04,wy+Math.sin(a)*s*.04);ctx.lineTo(wx+Math.cos(a)*s*.17,wy+Math.sin(a)*s*.17);ctx.stroke();}ctx.fillStyle=T.paint;ctx.beginPath();ctx.arc(wx,wy,s*.06,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(wx,wy,s*.025,0,Math.PI*2);ctx.fill();});
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(0,-bh*.6,s*.07,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=T.paint;ctx.beginPath();ctx.arc(0,-bh*.6,s*.04,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

// ─── BADGE UI COMPONENT ──────────────────────────────────────────────────────
function Badge({ color, children }) {
  return (
    <div style={{
      background: color+"18", border:`1px solid ${color}66`,
      color, padding:"4px 11px", borderRadius:5, fontSize:11,
      fontFamily:FONT_TITLE, letterSpacing:1, lineHeight:1.4,
      textShadow:`0 0 8px ${color}`, boxShadow:`0 0 8px ${color}22`,
    }}>{children}</div>
  );
}

// ─── TOUCH BUTTON ────────────────────────────────────────────────────────────
function TBtn({ label, code, keysRef, size=52 }) {
  const press = (e) => { 
    e.preventDefault();
    if(keysRef.current) keysRef.current[code]=true; 
  };
  const release = (e) => { 
    e.preventDefault();
    if(keysRef.current) keysRef.current[code]=false; 
  };
  return (
    <div
      onTouchStart={press} onTouchEnd={release} onTouchCancel={release}
      onPointerDown={press} onPointerUp={release} onPointerLeave={release}
      style={{
        width:size, height:size, borderRadius:10, 
        background:"linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
        border:"2px solid rgba(255,255,255,0.25)", 
        display:"flex", alignItems:"center",
        justifyContent:"center", fontSize: size * 0.4, cursor:"pointer", 
        userSelect:"none", touchAction:"none", 
        color:"rgba(255,255,255,0.9)",
        WebkitUserSelect:"none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
        transition: "transform 0.1s, box-shadow 0.1s",
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >{label}</div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
function CarGo() {
  const canvasRef = useRef(null);
  const startRef  = useRef(null);
  const keysRef   = useRef({});
  const [ui, setUi] = useState({
    phase:"menu", score:0, coins:0, tier:0, effects:{},
    lives:MAX_LIVES, highScore:0, newHigh:false, combo:0, difficulty:1,
    stats:{coinsCollected:0,obstaclesHit:0,pupsCollected:0},
  });

  // ── Font injection
  useEffect(()=>{
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@500;600;700&display=swap";
    document.head.appendChild(link);
    return ()=>{ try{document.head.removeChild(link);}catch(e){} };
  },[]);

  useEffect(()=>{
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    let running=true, lastTime=0, uiClock=0;
    const keys = keysRef.current;
    let highScore = parseInt(localStorage.getItem("cargo_hs")||"0");
    let g = null;

    // Shake state
    let shakeMag=0, shakeX=0, shakeY=0;
    const addShake = mag => { shakeMag = Math.max(shakeMag, mag); };

    // Web Audio beeps
    let audioCtx = null;
    const getAudio = () => { if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)(); return audioCtx; };
    const beep = (freq=440,type="sine",dur=0.08,vol=0.15,delay=0)=>{
      try{
        const ac=getAudio(); const o=ac.createOscillator(); const g2=ac.createGain();
        o.connect(g2); g2.connect(ac.destination);
        o.type=type; o.frequency.value=freq;
        g2.gain.setValueAtTime(vol,ac.currentTime+delay);
        g2.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+delay+dur);
        o.start(ac.currentTime+delay); o.stop(ac.currentTime+delay+dur);
      }catch(e){}
    };
    const sfxCoin    = ()=>{ beep(880,"triangle",0.07,0.12); beep(1320,"triangle",0.05,0.08,0.07); };
    const sfxUpgrade = ()=>{ [523,659,784,1046].forEach((f,i)=>beep(f,"triangle",0.12,0.18,i*0.08)); };
    const sfxHit     = ()=>{ beep(120,"sawtooth",0.12,0.25); };
    const sfxPup     = ()=>{ beep(660,"sine",0.06,0.15); beep(880,"sine",0.06,0.12,0.06); };

    // ── Helpers ──────────────────────────────────────────────────────────────
    const mkObs = existing => {
      for(let a=0;a<40;a++){
        const w=rnd(32,68),h=rnd(32,68);
        const x=rnd(BL+12,BR-w-12),y=rnd(BT+12,BB-h-12);
        if(existing.every(o=>Math.abs(o.x+o.w/2-x-w/2)>90||Math.abs(o.y+o.h/2-y-h/2)>90))
          return {x,y,w,h};
      }
      return null;
    };
    const mkCoin = obs => {
      const base = obs[Math.floor(Math.random()*obs.length)];
      const cx = (base?.x||W/2)+base?.w/2+rnd(-60,60);
      const cy = (base?.y||H/2)+base?.h/2+rnd(-60,60);
      return { x:clamp(cx,BL+16,BR-16), y:clamp(cy,BT+16,BB-16), p:rnd(0,Math.PI*2) };
    };
    const mkPup = obs => {
      for(let a=0;a<25;a++){
        const x=rnd(BL+24,BR-24),y=rnd(BT+24,BB-24);
        if(obs.every(o=>Math.hypot(o.x+o.w/2-x,o.y+o.h/2-y)>55))
          return {...PUPS[Math.floor(Math.random()*PUPS.length)],x,y,p:rnd(0,Math.PI*2)};
      }
      return null;
    };

    // ── Init ─────────────────────────────────────────────────────────────────
    const init = () => {
      const obs=[];
      for(let i=0;i<5;i++){ const o=mkObs(obs); if(o) obs.push(o); }
      const coins=[];
      for(let i=0;i<4;i++) coins.push(mkCoin(obs));
      g = {
        phase:"countdown", countdownTimer:210,
        score:0, totalC:0, tierIdx:0,
        lives:MAX_LIVES, invincible:0,
        difficulty:1, diffTimer:0,
        flash:0, flashColor:"#fff", flashText:"",
        combo:0, comboTimer:0,
        eff:{nitro:0,shield:0,magnet:0},
        tick:0,
        car:{x:W/2,y:H/2,angle:0,speed:0,vx:0,vy:0,driftAngle:0,driftIntensity:0},
        obs, coins, pups:[],
        tireMarks:[],
        trails:[], parts:[],
        obTimer:380, puTimer:260,
        stats:{coinsCollected:0,obstaclesHit:0,pupsCollected:0},
      };
    };
    startRef.current = init;

    // ── Speedometer ──────────────────────────────────────────────────────────
    const drawSpeedometer = (speed,maxV,tierIdx) => {
      const cx=W-76,cy=H-72,r=52;
      ctx.fillStyle="rgba(4,6,20,0.92)";
      ctx.beginPath();ctx.arc(cx,cy,r+7,0,Math.PI*2);ctx.fill();
      const T=TIERS[tierIdx];
      ctx.strokeStyle=T.paint+"44";ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(cx,cy,r+6,0,Math.PI*2);ctx.stroke();
      const a0=Math.PI*.75,a1=Math.PI*2.25,ratio=Math.min(Math.abs(speed)/maxV,1);
      ctx.strokeStyle="#0d1225";ctx.lineWidth=12;ctx.lineCap="round";
      ctx.beginPath();ctx.arc(cx,cy,r-10,a0,a1);ctx.stroke();
      if(ratio>.002){
        const sc=ratio<.5?"#00ff88":ratio<.82?"#ffdd00":"#ff3344";
        ctx.strokeStyle=sc;ctx.lineWidth=12;
        ctx.beginPath();ctx.arc(cx,cy,r-10,a0,a0+(a1-a0)*ratio);ctx.stroke();
        ctx.save();ctx.shadowBlur=14;ctx.shadowColor=sc;ctx.strokeStyle=sc;ctx.lineWidth=7;ctx.globalAlpha=.35;
        ctx.beginPath();ctx.arc(cx,cy,r-10,a0,a0+(a1-a0)*ratio);ctx.stroke();
        ctx.restore();
      }
      const na=a0+(a1-a0)*ratio;
      ctx.strokeStyle="#e8ecff";ctx.lineWidth=2.5;ctx.lineCap="round";
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(na)*(r-16),cy+Math.sin(na)*(r-16));ctx.stroke();
      ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(cx,cy,4.5,0,Math.PI*2);ctx.fill();
      const kph=Math.round(Math.abs(speed)*30);
      ctx.font=`bold 14px ${FONT_TITLE}`;ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillStyle="#e8ecff";ctx.fillText(kph,cx,cy+1);
      ctx.font=`7px ${FONT_UI}`;ctx.fillStyle="#3a5578";ctx.fillText("km/h",cx,cy+14);
      TIERS.forEach((t,i)=>{
        const pa=a0+(a1-a0)*(i/(TIERS.length-.6));
        ctx.fillStyle=i<=tierIdx?t.paint:"#111828";
        ctx.beginPath();ctx.arc(cx+Math.cos(pa)*(r),cy+Math.sin(pa)*(r),4.5,0,Math.PI*2);ctx.fill();
      });
    };

    // ── Speed Lines ──────────────────────────────────────────────────────────
    const drawSpeedLines = (car,maxV) => {
      const ratio=Math.abs(car.speed)/maxV;
      if(ratio<0.55)return;
      const intensity=(ratio-0.55)/0.45;
      ctx.save();ctx.globalAlpha=intensity*.12;ctx.strokeStyle="#8bb8ff";ctx.lineWidth=1;
      for(let i=0;i<Math.floor(intensity*14)+4;i++){
        const a=car.angle+rnd(-0.6,0.6);
        const dist=rnd(18,110);const len=rnd(18,55)*intensity;
        const sx=car.x+Math.cos(a+Math.PI)*dist+rnd(-28,28);
        const sy=car.y+Math.sin(a+Math.PI)*dist+rnd(-28,28);
        ctx.beginPath();ctx.moveTo(sx,sy);
        ctx.lineTo(sx+Math.cos(a+Math.PI)*len,sy+Math.sin(a+Math.PI)*len);
        ctx.stroke();
      }
      ctx.restore();
    };

    // ── Update ───────────────────────────────────────────────────────────────
    const update = dt => {
      if(!g || g.phase==="paused") return;

      if(g.phase==="countdown"){
        g.countdownTimer-=dt;
        if(g.countdownTimer<=0) g.phase="playing";
        return;
      }
      if(g.phase!=="playing") return;

      g.tick+=dt;
      if(g.invincible>0) g.invincible-=dt;
      if(g.flash>0) g.flash-=dt;
      if(g.comboTimer>0) g.comboTimer-=dt;
      else if(g.comboTimer<=0 && g.comboTimer!==-1) g.combo=0;

      // Difficulty ramp
      g.diffTimer+=dt;
      if(g.diffTimer>1800){ g.diffTimer=0; g.difficulty=Math.min(g.difficulty+0.12,2.8); }

      const car=g.car, T=TIERS[g.tierIdx];
      const nitroMult=g.eff.nitro>0?1.85:1;
      const acc=T.acc*nitroMult;
      const trn=T.trn;

      // Controls with drift mechanics
      const turning = (keys["ArrowLeft"]||keys["KeyA"]) ? -1 : (keys["ArrowRight"]||keys["KeyD"]) ? 1 : 0;
      if (turning !== 0) {
        car.angle += turning * trn * dt * (car.speed > 0 ? 1 : -1);
        // Drift: if moving fast and turning, calculate drift angle
        if (Math.abs(car.speed) > 1.5 && Math.abs(turning) > 0) {
          const targetDrift = turning * Math.min(Math.abs(car.speed) * 0.15, 0.5);
          car.driftAngle += (targetDrift - car.driftAngle) * 0.1 * dt;
          car.driftIntensity = Math.min(Math.abs(car.speed) * 0.12, 0.8);
          // Add tire marks when drifting
          if (Math.abs(car.driftIntensity) > 0.1 && Math.abs(car.speed) > 1.2) {
            const wheelOffset = 12 * TIERS[g.tierIdx].scale;
            const cosA = Math.cos(car.angle);
            const sinA = Math.sin(car.angle);
            // Left and right tire positions
            const lx = car.x - sinA * wheelOffset;
            const ly = car.y + cosA * wheelOffset;
            const rx = car.x + sinA * wheelOffset;
            const ry = car.y - cosA * wheelOffset;
            g.tireMarks.push({ x: lx, y: ly, life: 180, alpha: 0.6 });
            g.tireMarks.push({ x: rx, y: ry, life: 180, alpha: 0.6 });
            if (g.tireMarks.length > 300) g.tireMarks.splice(0, 2);
          }
        } else {
          car.driftIntensity *= 0.92;
          car.driftAngle *= 0.92;
        }
      } else {
        car.driftIntensity *= 0.88;
        car.driftAngle *= 0.88;
      }
      if(keys["ArrowUp"]||keys["KeyW"])    car.speed=Math.min(car.speed+acc*dt*g.difficulty*.7+acc*dt*.3, T.maxV);
      else if(keys["ArrowDown"]||keys["KeyS"]) car.speed=Math.max(car.speed-acc*dt*1.4, -T.maxV*.5);
      else car.speed*=Math.pow(.962,dt);
      if(Math.abs(car.speed)<.01) car.speed=0;

      // Move
      car.vx=Math.cos(car.angle)*car.speed;
      car.vy=Math.sin(car.angle)*car.speed;
      car.x+=car.vx*dt*3.6;
      car.y+=car.vy*dt*3.6;

      // Trails
      if(Math.abs(car.speed)>.1){
        g.trails.push({x:car.x,y:car.y,life:50});
        if(g.trails.length>130) g.trails.shift();
      }
      g.trails.forEach(t=>{t.life-=dt;});
      g.trails=g.trails.filter(t=>t.life>0);

      // Tire marks update
      for(const tm of g.tireMarks){tm.life-=dt;tm.alpha*=0.995;}
      g.tireMarks=g.tireMarks.filter(tm=>tm.life>0);

      // Wall collision
      const margin=18;
      let hitWall=false;
      if(car.x<BL+margin){car.x=BL+margin;car.speed*=-.25;hitWall=true;}
      if(car.x>BR-margin){car.x=BR-margin;car.speed*=-.25;hitWall=true;}
      if(car.y<BT+margin){car.y=BT+margin;car.speed*=-.25;hitWall=true;}
      if(car.y>BB-margin){car.y=BB-margin;car.speed*=-.25;hitWall=true;}
      if(hitWall){
        addShake(SHAKE_WALL);
        if(g.invincible<=0 && g.eff.shield<=0){
          sfxHit(); g.lives--;
          g.invincible=INV_FRAMES; g.combo=0;
          for(let j=0;j<10;j++){const a=rnd(0,Math.PI*2);g.parts.push({x:car.x,y:car.y,vx:Math.cos(a)*rnd(2,5),vy:Math.sin(a)*rnd(2,5),life:rnd(18,38),color:"#ff4422",r:rnd(2,5)});}
          if(g.lives<=0){
            g.phase="gameover";
            if(g.score>highScore){highScore=g.score;localStorage.setItem("cargo_hs",highScore);}
          }
        }
      }

      // Obstacle collision
      for(const o of g.obs){
        const pad=14;
        if(car.x>o.x-pad && car.x<o.x+o.w+pad && car.y>o.y-pad && car.y<o.y+o.h+pad){
          const cx2=o.x+o.w/2,cy2=o.y+o.h/2;
          const dx=car.x-cx2,dy=car.y-cy2,dist=Math.hypot(dx,dy)||1;
          car.x+=(dx/dist)*20; car.y+=(dy/dist)*20;
          const prevSpeed=car.speed;
          car.speed*=-.35;
          if(g.eff.shield<=0 && g.invincible<=0 && Math.abs(prevSpeed)>0.6){
            sfxHit();
            addShake(SHAKE_HIT);
            g.lives--; g.invincible=INV_FRAMES; g.combo=0;
            g.stats.obstaclesHit++;
            for(let j=0;j<14;j++){const a=rnd(0,Math.PI*2);g.parts.push({x:car.x,y:car.y,vx:Math.cos(a)*rnd(2,5.5),vy:Math.sin(a)*rnd(2,5.5),life:rnd(20,42),color:"#ff3322",r:rnd(2,5)});}
            if(g.lives<=0){
              g.phase="gameover";
              if(g.score>highScore){highScore=g.score;localStorage.setItem("cargo_hs",highScore);}
            }
          } else if(g.eff.shield>0) { addShake(2); }
          break;
        }
      }

      // Coin collection (with magnet)
      const magR=g.eff.magnet>0?130:0;
      for(let i=g.coins.length-1;i>=0;i--){
        const c=g.coins[i];
        c.p=(c.p+.055*dt)%(Math.PI*2);
        if(magR>0){
          const dd=Math.hypot(car.x-c.x,car.y-c.y);
          if(dd<magR){c.x+=(car.x-c.x)*.09*dt;c.y+=(car.y-c.y)*.09*dt;}
        }
        if(Math.hypot(car.x-c.x,car.y-c.y)<21){
          g.coins.splice(i,1);
          g.totalC++; g.stats.coinsCollected++;
          g.combo++; g.comboTimer=85;
          sfxCoin();
          const worth=10*(g.tierIdx+1)*Math.min(g.combo,5);
          g.score+=worth;
          for(let j=0;j<10;j++){const a=rnd(0,Math.PI*2);g.parts.push({x:c.x,y:c.y,vx:Math.cos(a)*rnd(1.5,4),vy:Math.sin(a)*rnd(1.5,4),life:rnd(22,48),color:"#ffdd00",r:rnd(2,5)});}
          if(g.combo>=3) for(let j=0;j<g.combo*3;j++){const a=rnd(0,Math.PI*2);g.parts.push({x:c.x,y:c.y,vx:Math.cos(a)*rnd(2,6),vy:Math.sin(a)*rnd(2,6),life:rnd(28,58),color:`hsl(${rnd(30,60)},100%,65%)`,r:rnd(2,7)});}
          const nt=getTierIdx(g.totalC);
          if(nt>g.tierIdx){
            g.tierIdx=nt;
            g.flash=130;g.flashColor=TIERS[nt].paint;g.flashText=`⬆ ${TIERS[nt].name.toUpperCase()}!`;
            sfxUpgrade();
            for(let j=0;j<44;j++){const a=rnd(0,Math.PI*2);g.parts.push({x:car.x,y:car.y,vx:Math.cos(a)*rnd(3,9),vy:Math.sin(a)*rnd(3,9),life:rnd(50,90),color:TIERS[nt].paint,r:rnd(3,10)});}
          }
          g.coins.push(mkCoin(g.obs));
        }
      }

      // Powerup collection
      for(let i=g.pups.length-1;i>=0;i--){
        const p=g.pups[i];
        p.p=(p.p+.055*dt)%(Math.PI*2);
        if(Math.hypot(car.x-p.x,car.y-p.y)<26){
          g.pups.splice(i,1);
          g.eff[p.t]=420; g.stats.pupsCollected++;
          sfxPup();
          for(let j=0;j<22;j++){const a=rnd(0,Math.PI*2);g.parts.push({x:p.x,y:p.y,vx:Math.cos(a)*rnd(2,6),vy:Math.sin(a)*rnd(2,6),life:rnd(30,62),color:p.color,r:rnd(3,8)});}
        }
      }

      for(const k of["nitro","shield","magnet"]) if(g.eff[k]>0) g.eff[k]=Math.max(0,g.eff[k]-dt);

      // Particles update
      for(const p of g.parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.91;p.vy*=.91;p.life-=dt;}
      g.parts=g.parts.filter(p=>p.life>0);

      // Spawning
      g.puTimer-=dt;
      if(g.puTimer<=0 && g.pups.length<3){
        g.puTimer=rnd(200,460)/Math.min(g.difficulty,1.8);
        const p=mkPup(g.obs);if(p) g.pups.push(p);
      }
      g.obTimer-=dt;
      const maxObs=Math.min(6+g.tierIdx*2+Math.floor(g.difficulty*2),16);
      if(g.obTimer<=0 && g.obs.length<maxObs){
        g.obTimer=rnd(320,720)/Math.min(g.difficulty,2);
        const o=mkObs(g.obs);if(o) g.obs.push(o);
      }

      // Shake decay
      if(shakeMag>.05){
        shakeMag*=Math.pow(.82,dt);
        shakeX=(Math.random()-.5)*shakeMag*2;
        shakeY=(Math.random()-.5)*shakeMag*2;
      } else {shakeMag=0;shakeX=0;shakeY=0;}
    };

    // ── Render ───────────────────────────────────────────────────────────────
    const render = () => {
      ctx.save();
      if(shakeMag>.1) ctx.translate(shakeX,shakeY);

      // Background
      ctx.fillStyle="#070a14";ctx.fillRect(0,0,W,H);
      ctx.strokeStyle="#0f1426";ctx.lineWidth=1;
      for(let x=0;x<=W;x+=44){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<=H;y+=44){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

      // Arena road surface
      ctx.fillStyle="rgba(16,20,36,0.90)";
      ctx.fillRect(BL,BT,BR-BL,BB-BT);

      // Road grain texture
      ctx.fillStyle="rgba(255,255,255,0.012)";
      for(let x=BL+22;x<BR;x+=44) for(let y=BT+22;y<BB;y+=44) ctx.fillRect(x-1,y-1,2,2);

      // Danger zones
      ctx.fillStyle="rgba(255,20,0,0.04)";
      ctx.fillRect(0,0,W,BT);ctx.fillRect(0,BB,W,H-BB);
      ctx.fillRect(0,BT,BL,BB-BT);ctx.fillRect(BR,BT,W-BR,BB-BT);

      // Hazard stripes
      const dh=(x,y,w,h)=>{ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();for(let i=-h;i<w+h;i+=16){ctx.fillStyle=Math.floor(i/16)%2===0?"rgba(255,155,0,0.88)":"rgba(14,14,22,0.88)";ctx.beginPath();ctx.moveTo(x+i,y);ctx.lineTo(x+i+h,y+h);ctx.lineTo(x+i+h+16,y+h);ctx.lineTo(x+i+16,y);ctx.fill();}ctx.restore();};
      dh(BL-10,BT,10,BB-BT);dh(BR,BT,10,BB-BT);dh(BL,BT-10,BR-BL,10);dh(BL,BB,BR-BL,10);

      // Arena border glow (red when 1 life)
      const isDanger=g?.lives===1 && g?.phase==="playing";
      const bc=g?.phase==="gameover"?"#ff2200":isDanger?"#ff4422":"#1e3055";
      if(isDanger||g?.phase==="gameover"){
        ctx.save();ctx.shadowBlur=16;ctx.shadowColor=bc;
        ctx.strokeStyle=bc;ctx.lineWidth=3;ctx.strokeRect(BL,BT,BR-BL,BB-BT);
        ctx.restore();
      } else {
        ctx.strokeStyle=bc;ctx.lineWidth=2.5;ctx.strokeRect(BL,BT,BR-BL,BB-BT);
      }

      // Center dashes
      ctx.strokeStyle="#18243a";ctx.lineWidth=1.5;ctx.setLineDash([22,22]);
      ctx.beginPath();ctx.moveTo(W/2,BT);ctx.lineTo(W/2,BB);ctx.stroke();
      ctx.beginPath();ctx.moveTo(BL,H/2);ctx.lineTo(BR,H/2);ctx.stroke();
      ctx.setLineDash([]);

      if(!g){ctx.restore();return;}

      // Trails
      for(const t of g.trails){
        ctx.globalAlpha=(t.life/50)*.18;ctx.fillStyle="#2a3a5a";
        ctx.beginPath();ctx.arc(t.x,t.y,2.2,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;

      // Tire marks
      for(const tm of g.tireMarks){
        const tireAlpha = (tm.life / 180) * tm.alpha * 0.7;
        ctx.globalAlpha = tireAlpha;
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(tm.x, tm.y, 3 * TIERS[g.tierIdx].scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Obstacles
      for(const o of g.obs){
        ctx.fillStyle="rgba(0,0,0,0.28)";ctx.fillRect(o.x+4,o.y+4,o.w,o.h);
        const grad=ctx.createLinearGradient(o.x,o.y,o.x+o.w,o.y+o.h);
        grad.addColorStop(0,"#2c3a52");grad.addColorStop(1,"#192436");
        ctx.fillStyle=grad;ctx.fillRect(o.x,o.y,o.w,o.h);
        ctx.save();ctx.beginPath();ctx.rect(o.x,o.y,o.w,o.h);ctx.clip();
        for(let i=-o.h;i<o.w+o.h;i+=14){
          ctx.fillStyle=Math.floor(i/14)%2===0?"rgba(255,168,0,0.18)":"rgba(255,20,0,0.09)";
          ctx.beginPath();ctx.moveTo(o.x+i,o.y);ctx.lineTo(o.x+i+o.h,o.y+o.h);ctx.lineTo(o.x+i+o.h+14,o.y+o.h);ctx.lineTo(o.x+i+14,o.y);ctx.fill();
        }
        ctx.restore();
        ctx.strokeStyle="#3c4f66";ctx.lineWidth=1.5;ctx.strokeRect(o.x,o.y,o.w,o.h);
        // Corner accents
        ctx.strokeStyle="#4a6080";ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(o.x,o.y+5);ctx.lineTo(o.x,o.y);ctx.lineTo(o.x+5,o.y);ctx.stroke();
        ctx.beginPath();ctx.moveTo(o.x+o.w-5,o.y);ctx.lineTo(o.x+o.w,o.y);ctx.lineTo(o.x+o.w,o.y+5);ctx.stroke();
      }

      // Coins
      for(const c of g.coins){
        const r=9+Math.sin(c.p)*2;
        const grd=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,r+20);
        grd.addColorStop(0,"rgba(255,220,0,0.58)");grd.addColorStop(1,"rgba(255,220,0,0)");
        ctx.fillStyle=grd;ctx.beginPath();ctx.arc(c.x,c.y,r+20,0,Math.PI*2);ctx.fill();
        ctx.save();ctx.shadowBlur=13;ctx.shadowColor="#ffcc00";
        ctx.fillStyle="#ffdd00";ctx.beginPath();ctx.arc(c.x,c.y,r,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#ffaa00";ctx.beginPath();ctx.arc(c.x,c.y,r*.62,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="rgba(255,255,200,.95)";
        ctx.font=`bold ${Math.floor(r+2)}px monospace`;
        ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("$",c.x,c.y+.5);
        ctx.restore();
      }

      // Powerups
      for(const p of g.pups){
        const r=14+Math.sin(p.p)*2.5;
        const grd=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r+15);
        grd.addColorStop(0,p.color+"66");grd.addColorStop(1,p.color+"00");
        ctx.fillStyle=grd;ctx.beginPath();ctx.arc(p.x,p.y,r+15,0,Math.PI*2);ctx.fill();
        ctx.save();ctx.shadowBlur=14;ctx.shadowColor=p.glow;
        ctx.fillStyle=p.color+"44";ctx.strokeStyle=p.color;ctx.lineWidth=2.5;
        ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.stroke();
        ctx.restore();
        ctx.font=`${Math.floor(r+3)}px serif`;
        ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(p.label,p.x,p.y+1);
        ctx.font=`8px ${FONT_TITLE}`;ctx.fillStyle=p.color;ctx.fillText(p.desc,p.x,p.y+r+10);
      }

      // Particles
      for(const p of g.parts){
        ctx.globalAlpha=Math.min(p.life/15,1)*.9;
        ctx.fillStyle=p.color;
        ctx.beginPath();ctx.arc(p.x,p.y,p.r*Math.min(p.life/8,1),0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;

      // Shield bubble
      if(g.eff.shield>0){
        ctx.save();ctx.shadowBlur=22;ctx.shadowColor="#44ff99";
        ctx.globalAlpha=.28+Math.sin(g.tick*.22)*.12;
        ctx.strokeStyle="#44ff99";ctx.lineWidth=3;
        ctx.beginPath();ctx.arc(g.car.x,g.car.y,36,0,Math.PI*2);ctx.stroke();
        ctx.restore();ctx.globalAlpha=1;
      }

      // Nitro exhaust
      if(g.eff.nitro>0 && Math.abs(g.car.speed)>.3){
        const{x,y,angle}=g.car,bx=x-Math.cos(angle)*28,by=y-Math.sin(angle)*28;
        for(let i=0;i<6;i++){
          const fl=rnd(10,32),sp=rnd(-.38,.38),fa=angle+Math.PI+sp;
          ctx.globalAlpha=.45+Math.random()*.4;
          ctx.fillStyle=["#00aaff","#ffffff","#00ddff","#88ccff","#aaeeff","#ccf5ff"][i];
          ctx.beginPath();ctx.moveTo(bx,by);
          ctx.lineTo(bx+Math.cos(fa-.14)*fl,by+Math.sin(fa-.14)*fl);
          ctx.lineTo(bx+Math.cos(fa+.14)*fl,by+Math.sin(fa+.14)*fl);
          ctx.fill();
        }
        ctx.globalAlpha=1;
      }

      drawSpeedLines(g.car, TIERS[g.tierIdx].maxV);

      // Draw car (flickers during invincibility)
      if(g.invincible<=0 || Math.floor(g.invincible/6)%2===0){
        drawEmojiCar(ctx,g.car.x,g.car.y,g.car.angle,g.tierIdx);
      }

      // Flash overlay (upgrade etc.)
      if(g.flash>0){
        ctx.globalAlpha=(g.flash/130)*.38;ctx.fillStyle=g.flashColor;ctx.fillRect(0,0,W,H);
        ctx.globalAlpha=Math.min(g.flash/130*2.5,1);
        ctx.font=`bold 34px ${FONT_TITLE}`;ctx.textAlign="center";ctx.textBaseline="middle";
        ctx.fillStyle="#fff";ctx.fillText(g.flashText,W/2,H/2-80);
        ctx.globalAlpha=1;
      }

      // Combo text
      if(g.combo>=2 && g.comboTimer>0){
        ctx.globalAlpha=Math.min(g.comboTimer/70,1);
        ctx.font=`bold ${14+g.combo*2.5}px ${FONT_TITLE}`;
        ctx.textAlign="center";ctx.textBaseline="middle";
        ctx.fillStyle=`hsl(${40+g.combo*9},100%,62%)`;
        ctx.shadowColor=`hsl(${40+g.combo*9},100%,62%)`;ctx.shadowBlur=12;
        ctx.fillText(`x${g.combo} COMBO!`,W/2,BT+38);
        ctx.shadowBlur=0;ctx.globalAlpha=1;
      }

      // Countdown overlay
      if(g.phase==="countdown"){
        const sec=Math.ceil(g.countdownTimer/70);
        const pulse=1+(1-(g.countdownTimer%70)/70)*.5;
        ctx.fillStyle="rgba(0,0,0,0.52)";ctx.fillRect(0,0,W,H);
        ctx.save();ctx.translate(W/2,H/2);ctx.scale(pulse,pulse);
        const label=sec>0?String(sec):"GO!";
        ctx.font=`900 100px ${FONT_TITLE}`;
        ctx.textAlign="center";ctx.textBaseline="middle";
        ctx.shadowBlur=40;ctx.shadowColor=sec>0?"#ffaa00":"#00cc66";
        ctx.fillStyle=sec>0?"#ffdd00":"#22ff88";
        ctx.fillText(label,0,0);
        ctx.restore();
      }

      drawSpeedometer(g.car.speed, TIERS[g.tierIdx].maxV, g.tierIdx);

      // Pause overlay
      if(g.phase==="paused"){
        ctx.fillStyle="rgba(0,0,0,0.68)";ctx.fillRect(0,0,W,H);
        ctx.font=`900 54px ${FONT_TITLE}`;ctx.textAlign="center";ctx.textBaseline="middle";
        ctx.shadowBlur=30;ctx.shadowColor="#ffaa00";
        ctx.fillStyle="#ffdd00";ctx.fillText("PAUSED",W/2,H/2-22);
        ctx.shadowBlur=0;
        ctx.font=`500 15px ${FONT_UI}`;ctx.fillStyle="#3a5577";
        ctx.fillText("SPACE  to continue",W/2,H/2+40);
      }

      ctx.restore();
    };

    // ── Game loop ─────────────────────────────────────────────────────────────
    const loop = ts => {
      if(!running) return;
      const dt=lastTime?Math.min((ts-lastTime)/16.67,3):1;
      lastTime=ts;
      update(dt);render();
      if(g?.phase==="playing"||g?.phase==="countdown"){
        uiClock++;
        if(uiClock>=4){
          uiClock=0;
          setUi({phase:g.phase,score:g.score,coins:g.totalC,tier:g.tierIdx,
            effects:{...g.eff},lives:g.lives,highScore,newHigh:false,
            combo:g.combo,difficulty:g.difficulty,stats:{...g.stats}});
        }
      } else if(g?.phase==="gameover"){
        setUi(prev=>prev.phase==="gameover"?prev:{
          phase:"gameover",score:g.score,coins:g.totalC,tier:g.tierIdx,
          effects:{},lives:0,highScore,newHigh:g.score>=highScore&&g.score>0,
          combo:0,difficulty:g.difficulty,stats:{...g.stats}
        });
      }
      requestAnimationFrame(loop);
    };

    const onKD=e=>{
      keys[e.code]=true;
      if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code))e.preventDefault();
      if(e.code==="Space"){
        if(!g||g.phase==="menu"||g.phase==="gameover") init();
        else if(g.phase==="playing") g.phase="paused";
        else if(g.phase==="paused") g.phase="playing";
      }
    };
    const onKU=e=>{ keys[e.code]=false; };
    window.addEventListener("keydown",onKD);
    window.addEventListener("keyup",onKU);
    requestAnimationFrame(loop);
    return()=>{ running=false; window.removeEventListener("keydown",onKD); window.removeEventListener("keyup",onKU); };
  },[]);

  const tier=TIERS[ui.tier], next=TIERS[ui.tier+1];
  const upgPct=next?Math.min(((ui.coins-tier.minC)/(next.minC-tier.minC))*100,100):100;

  return (
    <div style={{background:"#040610",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:FONT_TITLE}}>

      {/* ── Canvas ─────────────────────────────────────────────── */}
      <div style={{position:"relative",boxShadow:"0 0 60px rgba(0,0,0,0.8),0 0 120px rgba(0,0,0,0.5)"}}>
        <canvas ref={canvasRef} width={W} height={H} style={{display:"block",borderRadius:6}}/>

        {/* ── HUD overlay ─────────────────────────────────────── */}
        {(ui.phase==="playing"||ui.phase==="countdown")&&(
          <>
            {/* Top bar */}
            <div style={{position:"absolute",top:0,left:BL,width:BR-BL,pointerEvents:"none",
              display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 12px"}}>
              <div style={{fontSize:22,fontWeight:900,color:"#ffdd00",textShadow:"0 0 14px #ffaa00,0 0 28px #ff880055"}}>
                ⭐ {ui.score.toLocaleString()}
              </div>
              <div style={{display:"flex",gap:5}}>
                {[...Array(MAX_LIVES)].map((_,i)=>(
                  <span key={i} style={{fontSize:17,filter:i<ui.lives?"drop-shadow(0 0 5px #ff3366)":"grayscale(1) opacity(0.22)",transition:"all 0.3s"}}>❤️</span>
                ))}
              </div>
              <div style={{fontSize:9,color:"#2a3d56",letterSpacing:2,fontFamily:FONT_UI}}>
                LVL {Math.floor(ui.difficulty||1)+1}
              </div>
            </div>

            {/* Tier + upgrade bar */}
            <div style={{position:"absolute",top:50,left:BL+12,pointerEvents:"none"}}>
              <div style={{fontSize:11,color:tier?.paint,letterSpacing:2,marginBottom:5,fontWeight:700}}>
                {tier?.name?.toUpperCase()}
              </div>
              {next&&(
                <div style={{width:108}}>
                  <div style={{fontSize:8,color:"#2a3a50",marginBottom:3,letterSpacing:1,fontFamily:FONT_UI}}>
                    → {next.name} &nbsp; {next.minC-ui.coins} left
                  </div>
                  <div style={{height:5,background:"#0c1424",borderRadius:3,overflow:"hidden",boxShadow:`0 0 4px ${tier?.paint}22`}}>
                    <div style={{height:"100%",width:`${upgPct}%`,background:`linear-gradient(90deg,${tier?.paint}99,${tier?.paint})`,borderRadius:3,transition:"width 0.4s ease",boxShadow:`0 0 8px ${tier?.paint}88`}}/>
                  </div>
                </div>
              )}
              {!next&&<div style={{fontSize:9,color:"#ffaa44",letterSpacing:2}}>MAX TIER ⚡</div>}
            </div>

            {/* Active powerups */}
            <div style={{position:"absolute",top:50,right:10,display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end",pointerEvents:"none"}}>
              {ui.effects?.nitro>0&&<Badge color="#00c8ff">⚡ {(ui.effects.nitro/60).toFixed(1)}s</Badge>}
              {ui.effects?.shield>0&&<Badge color="#44ff99">🛡 {(ui.effects.shield/60).toFixed(1)}s</Badge>}
              {ui.effects?.magnet>0&&<Badge color="#ffdd44">🧲 {(ui.effects.magnet/60).toFixed(1)}s</Badge>}
            </div>
          </>
        )}

        {/* ── Menu screen ─────────────────────────────────────── */}
        {ui.phase==="menu"&&(
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(4,6,16,0.96)"}}>

            {/* Title */}
            <div style={{fontSize:72,fontWeight:900,color:"#ffdd00",letterSpacing:16,lineHeight:1,
              textShadow:"0 0 40px #ffaa00,0 0 80px #ff660055,0 3px 0 #8a6800"}}>
              CAR-GO
            </div>
            <div style={{color:"#1c3050",fontSize:10,letterSpacing:8,marginTop:7,marginBottom:30,fontFamily:FONT_UI,fontWeight:600}}>
              COLLECT · UPGRADE · SURVIVE
            </div>

            {/* Tier showcase */}
            <div style={{display:"flex",gap:18,marginBottom:28}}>
              {TIERS.map((t,i)=>(
                <div key={i} style={{textAlign:"center"}}>
                  <div style={{width:62,height:62,background:`${t.paint}12`,borderRadius:12,border:`1px solid ${t.paint}3a`,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,marginBottom:6,
                    boxShadow:`0 0 14px ${t.paint}1a,inset 0 0 12px ${t.paint}0a`}}>
                    {["🚗","🚘","🏎","⚡"][i]}
                  </div>
                  <div style={{color:t.paint,fontSize:8,letterSpacing:2,fontWeight:700}}>{t.name.toUpperCase()}</div>
                  <div style={{color:"#182840",fontSize:7,marginTop:2,fontFamily:FONT_UI}}>{t.minC}+ coins</div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div style={{color:"#253a52",fontSize:10,lineHeight:2.8,textAlign:"center",marginBottom:28,letterSpacing:1,fontFamily:FONT_UI,fontWeight:600}}>
              W / ↑ &nbsp; ACCELERATE &nbsp;·&nbsp; S / ↓ &nbsp; BRAKE &nbsp;·&nbsp; A D / ← → &nbsp; STEER<br/>
              <span style={{color:"#1a2d42",letterSpacing:2}}>SPACE — START / PAUSE &nbsp;&nbsp; 3 LIVES</span>
            </div>

            <button onClick={()=>startRef.current?.()}
              style={{padding:"15px 68px",background:"linear-gradient(135deg,#ffee44,#ffaa00)",
                color:"#06070e",border:"none",borderRadius:7,fontSize:22,fontWeight:900,cursor:"pointer",
                fontFamily:FONT_TITLE,letterSpacing:7,
                boxShadow:"0 0 28px #ffaa00,0 0 56px #ff880033,0 4px 0 #886600",
                transition:"all 0.15s",outline:"none"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.05)";e.currentTarget.style.boxShadow="0 0 40px #ffaa00,0 0 80px #ff880055,0 4px 0 #886600";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 0 28px #ffaa00,0 0 56px #ff880033,0 4px 0 #886600";}}
              onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
              onMouseUp={e=>e.currentTarget.style.transform="scale(1.05)"}
            >DRIVE</button>

            {ui.highScore>0&&(
              <div style={{marginTop:18,color:"#1e3248",fontSize:11,letterSpacing:3,fontFamily:FONT_UI,fontWeight:600}}>
                🏆 BEST SCORE: {ui.highScore.toLocaleString()}
              </div>
            )}

            {/* Powerup legend */}
            <div style={{display:"flex",gap:24,marginTop:24}}>
              {PUPS.map(p=>(
                <div key={p.t} style={{textAlign:"center"}}>
                  <div style={{width:34,height:34,borderRadius:"50%",border:`2px solid ${p.color}44`,
                    background:`${p.color}14`,display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:16,margin:"0 auto 4px",boxShadow:`0 0 10px ${p.color}1a`}}>{p.label}</div>
                  <div style={{color:p.color+"66",fontSize:7,letterSpacing:2,fontFamily:FONT_UI,fontWeight:600}}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Game Over screen ─────────────────────────────────── */}
        {ui.phase==="gameover"&&(
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(4,4,14,0.96)"}}>

            <div style={{fontSize:58,fontWeight:900,color:"#ff2233",letterSpacing:8,
              textShadow:"0 0 36px #ff0000,0 0 80px #aa000055,0 3px 0 #660000"}}>
              WRECKED!
            </div>

            <div style={{fontSize:46,color:"#ffdd00",marginTop:14,fontWeight:700,
              textShadow:"0 0 18px #ffaa00,0 0 40px #ff880033"}}>
              ⭐ {ui.score.toLocaleString()}
            </div>

            {ui.newHigh&&(
              <div style={{color:"#ffaa44",fontWeight:900,fontSize:18,marginTop:10,
                textShadow:"0 0 18px #ff8800",letterSpacing:4,fontFamily:FONT_UI}}>
                🏆 &nbsp; NEW RECORD!
              </div>
            )}
            {!ui.newHigh&&ui.highScore>0&&(
              <div style={{color:"#1e2d40",fontSize:11,marginTop:8,letterSpacing:3,fontFamily:FONT_UI,fontWeight:600}}>
                BEST: ⭐ {ui.highScore.toLocaleString()}
              </div>
            )}

            {/* Stats grid */}
            <div style={{display:"flex",gap:14,marginTop:22,marginBottom:6}}>
              {[
                {label:"COINS",value:ui.coins,icon:"🪙"},
                {label:"CAR",value:TIERS[ui.tier]?.name,icon:"🚗"},
                {label:"HITS",value:ui.stats?.obstaclesHit||0,icon:"💥"},
                {label:"POWER-UPS",value:ui.stats?.pupsCollected||0,icon:"⚡"},
              ].map(s=>(
                <div key={s.label} style={{textAlign:"center",background:"rgba(255,255,255,0.04)",
                  border:"1px solid #1a2535",borderRadius:10,padding:"12px 16px",
                  boxShadow:"inset 0 0 8px rgba(0,0,0,0.3)"}}>
                  <div style={{fontSize:22,marginBottom:5}}>{s.icon}</div>
                  <div style={{color:"#dde8ff",fontSize:18,fontWeight:700}}>{s.value}</div>
                  <div style={{color:"#1e2d42",fontSize:7,letterSpacing:2,marginTop:3,fontFamily:FONT_UI,fontWeight:600}}>{s.label}</div>
                </div>
              ))}
            </div>

            <button onClick={()=>startRef.current?.()}
              style={{marginTop:22,padding:"14px 64px",
                background:"linear-gradient(135deg,#ffee44,#ffaa00)",
                color:"#06070e",border:"none",borderRadius:7,fontSize:20,fontWeight:900,cursor:"pointer",
                fontFamily:FONT_TITLE,letterSpacing:5,
                boxShadow:"0 0 26px #ffaa00,0 3px 0 #886600",transition:"all 0.15s",outline:"none"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.05)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";}}
              onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
              onMouseUp={e=>e.currentTarget.style.transform="scale(1.05)"}
            >RETRY</button>
          </div>
        )}
      </div>

      {/* ── Touch controls ─────────────────────────────────────── */}
      {/* Desktop: small controls below, Mobile: larger controls at bottom */}
      <div className="mobile-controls" style={{
        display:'flex',
        gap:8,
        marginTop:14,
        alignItems:'center',
        flexWrap:'wrap',
        justifyContent:'center',
        '@media (maxWidth: 768px)': {
          position: 'fixed',
          bottom: 20,
          left: 0,
          right: 0,
          justifyContent: 'space-around',
          padding: '0 10px',
          zIndex: 1000,
        }
      }}>
        {/* Directional Pad - Left side */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(3, minmax(44px, 60px))',
          gridTemplateRows:'repeat(3, minmax(44px, 60px))',
          gap: 4,
        }}>
          <div/>
          <TBtn label="▲" code="ArrowUp" keysRef={keysRef} size={Math.min(window.innerWidth * 0.12, 60)}/>
          <div/>
          <TBtn label="◀" code="ArrowLeft" keysRef={keysRef} size={Math.min(window.innerWidth * 0.12, 60)}/>
          <TBtn label="▼" code="ArrowDown" keysRef={keysRef} size={Math.min(window.innerWidth * 0.12, 60)}/>
          <TBtn label="▶" code="ArrowRight" keysRef={keysRef} size={Math.min(window.innerWidth * 0.12, 60)}/>
        </div>
        
        {/* Action Buttons - Right side */}
        <div style={{display:'flex',flexDirection:'column',gap: 8}}>
          <button 
            onClick={()=>startRef.current?.()}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #44ff44, #22aa22)',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: FONT_TITLE,
              letterSpacing: 2,
              boxShadow: '0 0 15px #44ff4466',
              minWidth: 100,
            }}
          >START</button>
          <button 
            onClick={()=>{
              const ev=new KeyboardEvent("keydown",{code:"Space",bubbles:true});
              window.dispatchEvent(ev);
            }}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #ffaa00, #ff6600)',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: FONT_TITLE,
              letterSpacing: 2,
              boxShadow: '0 0 15px #ffaa0066',
              minWidth: 100,
            }}
          >PAUSE</button>
        </div>
      </div>
      
      {/* Mobile-specific: Extra large touch zones overlay */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-controls {
            position: fixed !important;
            bottom: 10px !important;
            left: 0 !important;
            right: 0 !important;
            justify-content: space-around !important;
            padding: 5px 10px !important;
            background: rgba(0,0,0,0.5) !important;
            border-radius: 15px !important;
            z-index: 1000 !important;
          }
        }
      `}</style>
    </div>
  );
}

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<CarGo />);
}
