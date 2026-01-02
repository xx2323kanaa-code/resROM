/* ===============================
   Hand ROM Analyzer
   analyze.js v1.4.0-medfix
   =============================== */

const ANALYZE_VERSION = "v1.4.0-medfix";
const BUILD_TIME = "2026-01-02";

log(`Analyze.js loaded : 12ROMn ${ANALYZE_VERSION}`);
log(`BUILD ${BUILD_TIME}`);

function safeAnalyze(mode){
  log("--------------------------------------------------");
  analyze(mode);
}

function analyze(mode){
  log("analyze() start");
  log(`MODE = ${mode}`);
  log(`ROM = 12ROMn  VER = ${ANALYZE_VERSION}`);

  if(!window.lastLandmarks){
    log("No landmarks");
    return;
  }

  const lm = window.lastLandmarks;

  const fingerDefs = {
    index:  [5, 6, 7, 8],
    middle: [9,10,11,12],
    ring:   [13,14,15,16],
    pinky:  [17,18,19,20]
  };

  let resultText = "";

  for(const [name, ids] of Object.entries(fingerDefs)){
    const MCP = correctedAngle(lm[0], lm[ids[0]], lm[ids[1]]);
    const PIP = correctedAngle(lm[ids[0]], lm[ids[1]], lm[ids[2]]);
    const DIP = correctedAngle(lm[ids[1]], lm[ids[2]], lm[ids[3]]);

    if(mode === "EXT_OK"){
      // 伸展可能：屈曲・伸展を出す
      resultText += `
<b>${name}</b><br>
MCP：屈曲 ${MCP.toFixed(1)}°<br>
PIP：屈曲 ${PIP.toFixed(1)}°<br>
DIP：屈曲 ${DIP.toFixed(1)}°<br><br>
`;
    }else{
      // 伸展不能：総運動角のみ
      const totalROM = MCP + PIP + DIP;
      resultText += `
<b>${name}</b><br>
総運動角（TAM）：${totalROM.toFixed(1)}°<br><br>
`;
    }
  }

  document.getElementById("result").innerHTML = resultText;
  log("analysis finished");
}

/* ===== 角度計算（医学補正込み） ===== */

function correctedAngle(a,b,c){
  // b を頂点とした角度
  const ang = rawAngle(a,b,c);
  // MediaPipe は外角 → 屈曲角に変換
  return Math.max(0, 180 - ang);
}

function rawAngle(a,b,c){
  const v1 = vec(a,b);
  const v2 = vec(c,b);
  const dot = v1.x*v2.x + v1.y*v2.y + v1.z*v2.z;
  const mag = len(v1)*len(v2);
  if(mag === 0) return 0;
  return Math.acos(clamp(dot/mag,-1,1)) * 180/Math.PI;
}

function vec(p,q){
  return {x:p.x-q.x, y:p.y-q.y, z:p.z-q.z};
}
function len(v){
  return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
}
function clamp(v,min,max){
  return Math.min(max,Math.max(min,v));
}
