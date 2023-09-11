import { SnackbarProvider } from "notistack";
import { HashRouter as Router } from "react-router-dom";
import { Routes } from "apps/common/Routes";

function App() {
  return (
    <>
      <SnackbarProvider />
      <Router>
        <Routes />
      </Router>
    </>
  );
}

export default App;
