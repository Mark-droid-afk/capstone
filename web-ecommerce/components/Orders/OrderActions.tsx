import React from "react";

const OrderActions = ({ toggleEdit, toggleDetails }: any) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={toggleDetails}
        className="inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize text-green bg-green-light-6 hover:opacity-80 transition-opacity"
      >
        View
      </button>
      <button 
        onClick={toggleEdit} 
        className="inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize text-green bg-green-light-6 hover:opacity-80 transition-opacity"
      >
        Edit
      </button>
    </div>
  );
};

export default OrderActions;
