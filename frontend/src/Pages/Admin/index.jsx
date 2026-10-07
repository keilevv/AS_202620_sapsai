import Layout from "../../Components/Layout";
import Admin from "../../Components/Admin";

function AdminPage({ initialTab = 0 }) {
  return (
    <Layout user={null} initialTab={2}>
      <Admin initialTab={initialTab} />
    </Layout>
  );
}

export default AdminPage;
