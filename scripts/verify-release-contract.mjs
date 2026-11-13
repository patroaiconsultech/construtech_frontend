import fs from "node:fs";
import crypto from "node:crypto";

const fail=(message)=>{console.error(`release_contract_error=${message}`);process.exitCode=1;};
const sha=(path)=>crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex");

for(const path of ["package.json","package-lock.json",".env.example","Dockerfile",".github/workflows/ci.yml"]){
  if(!fs.existsSync(path))fail(`missing:${path}`);
}

if(process.exitCode)process.exit();

const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const lock=JSON.parse(fs.readFileSync("package-lock.json","utf8"));
const root=lock.packages?.[""];

if(!root)fail("package_lock_root_missing");
if(lock.lockfileVersion!==3)fail(`unexpected_lockfile_version:${lock.lockfileVersion}`);

for(const field of ["name","version"]){
  if(pkg[field]!==root?.[field])fail(`package_lock_${field}_mismatch`);
}

const stable=(v)=>JSON.stringify(Object.fromEntries(Object.entries(v||{}).sort(([a],[b])=>a.localeCompare(b))));
if(stable(pkg.dependencies)!==stable(root?.dependencies))fail("package_lock_dependencies_mismatch");
if(stable(pkg.devDependencies)!==stable(root?.devDependencies))fail("package_lock_devDependencies_mismatch");

const docker=fs.readFileSync("Dockerfile","utf8");
const ci=fs.readFileSync(".github/workflows/ci.yml","utf8");

if(!/npm ci --no-audit --no-fund/.test(docker))fail("docker_must_use_npm_ci");
if(/npm install\b/.test(docker))fail("docker_npm_install_fallback_forbidden");
if(!/npm ci --no-audit --no-fund/.test(ci))fail("ci_must_use_npm_ci");
if(/npm install\b/.test(ci))fail("ci_npm_install_fallback_forbidden");

if(fs.existsSync("env.example")){
  const canonical=fs.readFileSync(".env.example");
  const legacy=fs.readFileSync("env.example");
  if(!canonical.equals(legacy))fail("legacy_env_example_differs_from_canonical");
}

if(!process.exitCode){
  console.log(`release_contract_ok package_lock_sha256=${sha("package-lock.json")} env_sha256=${sha(".env.example")}`);
}
