import DetailsForm from "../../../Settings/DetailsForm";
import useAdmin from "../../../../hooks/useAdmin";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

function EditUserForm() {
  const { id } = useParams();
  const { user, getUser, isLoading } = useAdmin();

  useEffect(() => {
    getUser(id);
  }, [id]);

  const handleOnUpdateUser = (user) => {
    getUser(id);
  };

  return (
    <DetailsForm
      admin={true}
      user={user}
      loading={isLoading}
      onUpdate={handleOnUpdateUser}
    />
  );
}
export default EditUserForm;
