import React from "react";

import LoginModal from "./LoginModal";
import NotificationModal from "./NotificationModal";
import MemoryModal from "./MemoryModal";
import PricingModal from "./PricingModal";

const AllModals = () => {
  return (
    <div className="w-full">
      <LoginModal />
      <NotificationModal />
      <PricingModal />
      <MemoryModal />
    </div>
  );
};

export default AllModals;
