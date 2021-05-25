import styled from "styled-components";

//let height, width, idealHeight;
/*export const LocalPlayerAspectRatio = styled("div")`
  ${(props) =>  {
  if(props.idealHeight < props.height) {
    return `width: calc(${props.idealHeight}*16px/9); padding-top: ${props.idealHeight}px;`
  } else {
    return `width: 100%; padding-top:56.25%;`
  }
}};
`;

export const CarouselAspectRatio = styled("div")`
  ${(props) =>  {
  if(props.idealHeight < props.height) {
    return `width: calc(${props.idealHeight}*16px/9);`
  } else {
    return `width: 100%;`
  }
}};
`;*/
export const LocalPlayerAspectRatio = styled("div")`
  ${(props) =>  {
  if(props.idealHeight < props.height) {
    return `width: calc(${props.idealHeight}*16px/9); padding-top: ${props.idealHeight}px;`
  } else {
    //return `width: 100%; padding-top:56.25%;`
    const width = (props.idealHeight*16/9) > props.idealWidth ? props.idealWidth : props.idealHeight*16/9;
    const paddingTop = width * 0.5625;
    //return `width: calc(${props.idealHeight}*16px/9); max-width:${props.idealWidth}px; padding-top:56.25%;`
    return `width: ${width}px; padding-top:${paddingTop}px;`
  }
  // return `width: calc(${props.idealHeight}*16px/9); padding-top: ${props.idealHeight}px;`
}};
`;

export const CarouselAspectRatio = styled("div")`
  ${(props) =>  {
  if(props.idealHeight < props.height) {
    return `width: calc(${props.idealHeight}*16px/9);`
  } else {
    //return `width: 100%;`
    return `width: calc(${props.idealHeight}*16px/9); max-width:${props.idealWidth}px;`
  }
  //return `width: calc(${props.idealHeight}*16px/9);`
}};
`;
