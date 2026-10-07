import Modal from "../../../../Common/Modal";
import { useRef } from "react";
import { FaSeedling } from "react-icons/fa";
import CreateSpeciesForm from "../CreateSpeciesForm";

function CreateSpeciesModal({ isOpen, closeModal, onCreated, speciesItem = null }) {
  const submitRef = useRef(null);
  function handleConfirm() {
    if (typeof submitRef.current === "function") {
      submitRef.current();
    }
  }
  return (
    <Modal
      isOpen={isOpen}
      closeModal={closeModal}
      title={speciesItem ? "Edit Species" : "Create Species"}
      icon={FaSeedling}
      iconColor="text-green-600"
      onConfirm={handleConfirm}
    >
      <CreateSpeciesForm
        isModal={true}
        closeModal={closeModal}
        onCreated={onCreated}
        speciesItem={speciesItem}
        registerSubmit={(fn) => {
          submitRef.current = fn;
        }}
      />
    </Modal>
  );
}
export default CreateSpeciesModal;
