import { Container } from "react-bootstrap"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme'
import Header from "./components/header"
import Footer from "./components/footer"
import { Outlet } from "react-router-dom"

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-8">
          <Container>
            <div className="fade-in">
              <Outlet/>
            </div>
          </Container>
        </main>
        <Footer/>
        <ToastContainer/>
      </div>
    </ThemeProvider>
  )
}

export default App
