import { Scrollbar } from 'react-scrollbars-custom';


const CustomScrollComponent = ({ children, height = "400px" }) => {
  return (
    <Scrollbar
      style={{
        width: '100%',
        height: height,
        flex: '1'
      }}
      noDefaultStyles={false}
      minimalThumbSize={50}
      className="custom-scrollbar"
    >
      {children}
    </Scrollbar>
  );
};

export default CustomScrollComponent;