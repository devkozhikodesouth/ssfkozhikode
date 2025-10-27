import React from 'react'
type ToastProps = {
  message?: string;
  type?: 'success' | 'error' | 'info';
}
const Toast = ({message, type}:ToastProps) => {
  return (
    <div className="toast toast-top toast-center">
  
  <div className={`alert alert-${type}`}>
      <span>Registration successfully.</span>
  </div>
</div>
  )
}

export default Toast