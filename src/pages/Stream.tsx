import * as React from 'react';
import Navbar from '../components/Navbar';
import useRelayer from '../hooks/useRelayer';

export interface IStreamProps {
}

export function Stream (props: IStreamProps) {
 const  {
    wormhole,
    process_sol_stream,
    process_token_stream,
    process_sol_withdraw_stream,
    process_token_withdraw_stream,
    process_deposit_sol,
    process_deposit_token,
    process_fund_sol,
    process_fund_token,
    process_withdraw_sol,
    process_withdraw_token,
    process_swap_sol,
    encode_process_swap_token,
    registerApplicationContracts,
    receiveEncodedMsg,
    getCurrentMsg

  }  = useRelayer();
  return (
    <div>
         <div className="w-full h-screen flex flex-col">
      <Navbar/>
      </div>

  

     
    </div>
  );
}
