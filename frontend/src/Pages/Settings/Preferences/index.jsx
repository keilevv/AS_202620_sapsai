import { useOutletContext } from "react-router-dom";
import PreferencesForm from "../../../Components/Settings/PreferencesForm";

function PreferencesSettings() {
  const { user } = useOutletContext();
  return <PreferencesForm user={user} />;
}
export default PreferencesSettings;
