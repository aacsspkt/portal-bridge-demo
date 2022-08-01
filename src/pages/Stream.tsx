import * as React from 'react';

import { Deposit } from '../components/Deposit';
import { Fund } from '../components/Fund';
import { RegisterFetch } from '../components/RegisterFetch';
import { SolStream } from '../components/SolStream';
import { Swap } from '../components/Swap';
import { TokenStream } from '../components/TokenStream';
import { Withdraw } from '../components/Withdraw';

export interface IStreamProps {
}

export function Stream(props: IStreamProps) {
  let [index, setIndex] = React.useState<number>(0);


  return (
    <>
    <div>
         <div className="w-full h-screen flex flex-col">
     

            <div className="tabscontentlist">
              <div hidden={index !== 0}>
                <SolStream />

              </div>
              <div hidden={index !== 1}>
                <TokenStream />

              </div>
              <div hidden={index !== 2}>
                <Swap />

            <div className= "tabslist flex justify-center ">
                <div className={index!==0? "text-slate-500 p-3 px-10":"text-black border-b-2 border-black p-3 px-10"} onClick={()=>setIndex(0)}>SolStream</div>
                <div className={index!==1? "text-slate-500 p-3 px-10":"text-black border-b-2 border-black p-3 px-10"} onClick={()=>setIndex(1)}>TokenStream</div>
                <div className= {index!==2? "text-slate-500 p-3 px-10":"text-black border-b-2 border-black p-3 px-10"} onClick={()=>setIndex(2)}>Swap</div>
                <div className= {index!==3? "text-slate-500 p-3 px-10":"text-black border-b-2 border-black p-3 px-10"} onClick={()=>setIndex(3)}>Withdraw</div>
                <div className= {index!==4? "text-slate-500 p-3 px-10":"text-black border-b-2 border-black p-3 px-10"} onClick={()=>setIndex(4)}>Deposit</div>
                <div className= {index!==5? "text-slate-500 p-3 px-10":"text-black border-b-2 border-black p-3 px-10"} onClick={()=>setIndex(5)}>Fund</div>
                <div className= {index!==6? "text-slate-500 p-3 px-10":"text-black border-b-2 border-black p-3 px-10"} onClick={()=>setIndex(6)}>Register/Get Message</div>
            </div>

              </div>
              <div hidden={index !== 4}>
                <Deposit />

              </div>
              <div hidden={index !== 5}>
                <Fund />

              </div>
            </div>
            <div  hidden={index!==6}> 
            <RegisterFetch/>
            
            </div>
        </div>


      </div>
    </>
  );
}

