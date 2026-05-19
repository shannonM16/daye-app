import { useEffect } from 'react'

export default function ResetPassword() {
  useEffect(() => {
    window.location.replace('/?resetPassword=1')
  }, [])

  return null
}
