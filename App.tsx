import {Routes,Route} from "react-router-dom";
import Landing from "./routes/Landing";
import Workspace from "./routes/Workspace";
import ProjectPage from "./routes/ProjectPage";
import Ghostwriter from "./routes/Ghostwriter";
import Approvals from "./routes/Approvals";
import MemoryCenter from "./routes/MemoryCenter";
import IntelligenceStatus from "./routes/IntelligenceStatus";
import IntelligenceChat from "./routes/IntelligenceChat";
import ProjectOperations from "./routes/ProjectOperations";
import Today from "./routes/Today";
import Clients from "./routes/Clients";
import Providers from "./routes/Providers";
import Protected from "./auth/Protected";
import Login from "./routes/Login";
import ArtifactStudio from "./routes/ArtifactStudio";
import AdminPanel from "./routes/AdminPanel";
import InviteAccept from "./routes/InviteAccept";
import VisualAIStudio from "./routes/VisualAIStudio";
export default function App(){return <Routes>
  <Route path="/" element={<Landing/>}/>
  <Route path="/login" element={<Login/>}/>
  <Route path="/invite/accept" element={<InviteAccept/>}/>
  <Route path="/app/admin" element={<Protected><AdminPanel/></Protected>}/>
  <Route path="/app" element={<Protected><Workspace/></Protected>}/>
  <Route path="/app/today" element={<Protected><Today/></Protected>}/>
  <Route path="/app/clients" element={<Protected><Clients/></Protected>}/>
  <Route path="/app/providers" element={<Protected><Providers/></Protected>}/>
  <Route path="/app/intelligence" element={<Protected><IntelligenceChat/></Protected>}/>
  <Route path="/app/status" element={<Protected><IntelligenceStatus/></Protected>}/>
  <Route path="/app/projects/:projectId" element={<Protected><ProjectPage/></Protected>}/>
  <Route path="/app/projects/:projectId/operations" element={<Protected><ProjectOperations/></Protected>}/>
  <Route path="/app/projects/:projectId/ghostwriter" element={<Protected><Ghostwriter/></Protected>}/>
  <Route path="/app/projects/:projectId/artifacts" element={<Protected><ArtifactStudio/></Protected>}/>
  <Route path="/app/projects/:projectId/visual-ai" element={<Protected><VisualAIStudio/></Protected>}/>
  <Route path="/app/approvals" element={<Protected><Approvals/></Protected>}/>
  <Route path="/app/projects/:projectId/memory" element={<Protected><MemoryCenter/></Protected>}/>
</Routes>}
