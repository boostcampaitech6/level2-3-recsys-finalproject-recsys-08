import { ResponsiveNetwork } from "@nivo/network";
import { useNavigate } from 'react-router-dom';

export function MyResponsiveNetwork(props) {
  const navigate = useNavigate();
  return (
    <ResponsiveNetwork
      data={props.data}
      annotations={props.annotations}
      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      onClick = {(e) => {
        return navigate(`/chatbot?paper_id=${e.id}`);
      }}
      linkDistance={function (e) {
        return e.distance + 100;
      }}
      distanceMin={10}
      nodeTooltip={(e) => {
        return <a>{e.node.data.title}</a>
      }}
      centeringStrength={0.7}
      repulsivity={15}
      nodeSize={function (n) {
        return n.size * 2;
      }}
      activeNodeSize={function (n) {
        return 2.5 * n.size;
      }}
      inactiveNodeSize={30}
      nodeColor={function (e) {
        return e.color;
      }}
      linkThickness={function (n) {
        return 2 + 2 * n.target.data.height;
      }}
      linkBlendMode="multiply"
      motionConfig="wobbly"
    />
  );
}

export default { MyResponsiveNetwork };