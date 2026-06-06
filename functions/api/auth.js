import{json}from'../_lib/db.js';

export async function onRequestPost({request,env}){
  try{
    if(!env.ADMIN_PIN){
      return json({ok:false,error:'后台尚未设置 ADMIN_PIN，无法进入会计模式。'},403);
    }
    let pin=request.headers.get('X-Admin-Pin')||'';
    if(!pin){
      const body=await request.json().catch(()=>({}));
      pin=String(body.pin||'');
    }
    if(pin!==env.ADMIN_PIN){
      return json({ok:false,error:'会计密码不正确。'},401);
    }
    return json({ok:true,role:'accountant'});
  }catch(e){
    return json({ok:false,error:e.message||'登录验证失败。'},400);
  }
}
