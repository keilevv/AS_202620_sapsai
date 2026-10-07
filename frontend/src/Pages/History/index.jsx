import Layout from "../../Components/Layout";
import useStore from "../../hooks/useStore";

export default function History() {
  const user = useStore((state) => state.user);

  return <Layout user={user} initialTab={1} />;
}
