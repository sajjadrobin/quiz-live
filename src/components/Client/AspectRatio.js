import styled from "styled-components";

export const LocalPlayerAspectRatio = styled("div")`
  ${(props) =>  {
  const aspectHeight = props.width * .5625;
  if(aspectHeight > props.height) {
    const aspectWidth = props.height / .5625;
    return `width: calc(${aspectWidth}*100%/${props.width}); margin: 0 auto;`
  }
}};
`;
