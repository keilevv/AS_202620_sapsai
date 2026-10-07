import { useOutletContext } from "react-router-dom";
import DetailsForm from "../../../Components/Settings/DetailsForm";

function UserSettings() {
  const { user, loading, onUpdateUser } = useOutletContext();
  return (
    <DetailsForm
      user={user}
      loading={loading}
      onUpdate={onUpdateUser}
    />
  );
}
export default UserSettings;
