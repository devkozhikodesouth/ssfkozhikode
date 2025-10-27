"use client";
import React, { useRef } from "react";

const Modal = ({}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const open = () => {
    // use optional chaining to guard against undefined in odd environments
    dialogRef.current?.showModal();
  };

  const close = () => {
    dialogRef.current?.close();
  };

  return (
    <div>
      {/* Trigger button */}

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Hello!</h3>
          <p className="py-4">Press ESC key or click the button below to close</p>
          <div className="modal-action">
            {/* explicit close handler instead of relying on form dialog behavior */}
            <button className="btn" onClick={close} type="button">
              Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Modal;