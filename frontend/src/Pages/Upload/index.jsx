import Dashboard from "../../Components/Layout";
import useStore from "../../hooks/useStore";

export default function Upload() {
  const { user } = useStore();

  return <Dashboard user={user} initialTab={0} />;
}
