import Settings from "../../Components/Settings";
import Layout from "../../Components/Layout";
function SettingsPage() {
  return (
    <Layout user={null} initialTab={1}>
      <Settings />
    </Layout>
  );
}

export default SettingsPage;
