import { HashRouter, Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Home from "./pages/Home";
import Materials from "./pages/Materials";
import Submit from "./pages/Submit";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <HashRouter>
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <footer className="mx-auto max-w-5xl px-4 py-10 text-center text-xs text-slate-500">
        원데이 AI 클래스 · AI와 함께 내가 상상한 것을 실제로 만드는 하루
      </footer>
    </HashRouter>
  );
}
