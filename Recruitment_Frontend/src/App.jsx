import { Outlet } from 'react-router-dom'
import NotificationContainer from './components/common/NotificationContainer'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
      <NotificationContainer />
    </div>
  )
}

export default App