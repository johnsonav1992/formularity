import ReactDOM from 'react-dom/client';
import App from './Test';
import AnotherTest from './AnotherTest';

ReactDOM
    .createRoot( document.getElementById( 'root' )! )
    .render( <AnotherTest /> );
