import fs from "node:fs";import path from "node:path";import crypto from "node:crypto";
const root=path.resolve("dist");if(!fs.existsSync(root))throw new Error("dist_missing");const files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else{const b=fs.readFileSync(p);files.push({file:path.relative(root,p).replaceAll("\\","/"),bytes:b.length,sha256:crypto.createHash("sha256").update(b).digest("hex")})}}}
walk(root);fs.writeFileSync("BUILD_EVIDENCE.json",JSON.stringify({generated_at:new Date().toISOString(),files},null,2));console.log(`evidence=${files.length}`);
