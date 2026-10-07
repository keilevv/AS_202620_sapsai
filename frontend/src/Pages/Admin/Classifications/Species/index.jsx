import Layout from "../../../../Components/Layout";
import Species from "../../../../Components/Admin/Classifications/Species";
function SpeciesPage() {
  return (
    <Layout user={null} initialTab={2}>
      <Species />
    </Layout>
  );
}
export default SpeciesPage;
