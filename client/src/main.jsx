
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import {CssBaseline} from '@mui/material'
import { ToastContainer} from 'react-toastify';

createRoot(document.getElementById('root')).render(
  <>
  <ToastContainer
   position="top-right" 
   autoClose={5000} 
   hideProgressBar={false}
   newestOnTop={true}
   theme="light"
  />
  <CssBaseline/>
  <App/>
  </>
)
