import React from 'react';
import Registration from './registration';
import { Login } from './login';

export function Welcome(props) {
    return (
        <div id='welcome'>
        <h1>Welcome to VIP-Book!</h1>
        <img id='dollar' src='../images/dollar.png' />
        <p className='welcome-text-bold'>Home of VIPs.</p>
        <p className='welcome-text'>Join us if you think you are an important person</p>
        {props.children}
        </div>
    );
}
