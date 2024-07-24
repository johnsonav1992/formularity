import ReactDOM from 'react-dom/client';
// import AnotherTest from './AnotherTest';
import BasicTest from './BasicTest';
import DemoForm from './DemoForm';
// import FieldListTest from './FieldListTest';

ReactDOM
    .createRoot( document.getElementById( 'root' )! )
    // .render( <AnotherTest /> );
    //.render( <BasicTest /> );
    .render(<DemoForm/>);
// .render( <FieldListTest /> );
