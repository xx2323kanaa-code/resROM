/* =====================================================
   Hand ROM Analyzer
   analyze.js v1.6.0-buffered (STABLE)
   ===================================================== */

const ANALYZE_VERSION = "v1.6.0-buffered";
const ANALYZE_ID = "ANALYZE_STABLE_12ROMn";
const BUILD_TIME = "2026-01-02";

console.log(`### ${ANALYZE_ID} LOADED ${ANALYZE_VERSION} ###`);
if (typeof log === "function") {
  log(`Analyze.js loaded : 12ROMn ${ANALYZE_VERSION}`);
  log(`BUILD ${BUILD_TIME}`);
}

/* ========= public entry ========= */

function safeAnalyze(mode) {
  log("--------------------------------------------------");
  analyze(mode);
}

/* ========= main analyze ========= */

function analyze(mode) {
  log("analyze() start");
  log(`MODE = ${mode}`);
  log(`ROM = 12ROMn  VER = ${ANALYZE_VERSION}`);

  // ---- 安定化の核心：フレームバッファ ----
  const frames = window.landmarkBuffer;

  if (!frames || frames.length < 10) {
    log("Not enough frames for analysis");
    return;
  }

  // 解析に使うフレーム数（固定）
  const USE_N = Math.min(20, frames.length);
  const useFrames = frames.slice(frames.length - USE_N);

  // ---- 親指は含めない ----
  const fingerDefs = {
    index:  [5, 6, 7, 8],
    middle: [9,10,11,12],
    ring:   [13,14,15,16],
    pinky:  [17,18,19,20]
  };

  let resultHTML = "";

  for (const [name, ids] of Object.entries(fingerDefs)) {

    // 各関節の屈曲角をフレーム群から算出
    const MCPs = [];
    const PIPs = [];
    const DIPs = [];

    for (const lm of useFrames) {
      MCPs.push(flexAngle(lm[0], lm[ids[0]], lm[ids[1]]));
      PIPs.push(flexAngle(lm[ids[0]], lm[ids[1]], lm[ids[2]]));
      DIPs.push(flexAngle(lm[ids[1]], lm[ids[2]], lm[ids[3]]));
    }

    // 安定値：最大値（ROM測定として妥当）
    const MCP = max(MCPs);
    const PIP = max(PIPs);
    const DIP = max(DIPs);

    if (mode === "EXT_OK") {
      // 伸展可能：屈曲角のみ信頼
      resultHTML += `
<b>${name}</b><br>
MCP：屈曲 ${MCP.toFixed(1)}°<br>
PIP：屈曲 ${PIP.toFixed(1)}°<br>
DIP：屈曲 ${DIP.toFixed(1)}°<br><br>
`;
    } else {
      // 伸展不能：TAMのみ
      const TAM = MCP + PIP + DIP;
      resultHTML += `
<b>${name}</b><br>
総運動角（TAM）：${TAM.toFixed(1)}°<br><br>
`;
    }
  }

  const out = document.getElementById("result");
  if (out) out.innerHTML = resultHTML;

  log(`analysis finished (frames used = ${USE_N})`);
}

/* ========= geometry ========= */

// MediaPipeの外角 → 医学的屈曲角
function flexAngle(a, b, c) {
  const ang = rawAngle(a, b, c);
  return clamp(180 - ang, 0, 180);
}

function rawAngle(a, b, c) {
  const v1 = vec(a, b);
  const v2 = vec(c, b);
  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const mag = len(v1) * len(v2);
  if (mag === 0) return 0;
  return Math.acos(clamp(dot / mag, -1, 1)) * 180 / Math.PI;
}

function vec(p, q) {
  return { x: p.x - q.x, y: p.y - q.y, z: p.z - q.z };
}
function len(v) {
  return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
}
function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}
function max(arr) {
  return Math.max(...arr);
}
