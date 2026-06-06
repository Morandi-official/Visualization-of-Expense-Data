(function(){
  function $(id){return document.getElementById(id);}
  function setMode(mode){
    mode = mode === 'detail' ? 'detail' : 'simple';
    localStorage.setItem('expense_view_mode', mode);
    document.body.classList.toggle('simpleMode', mode === 'simple');
    document.body.classList.toggle('detailMode', mode === 'detail');
    var simple = $('simpleModeBtn');
    var detail = $('detailModeBtn');
    if(simple) simple.classList.toggle('active', mode === 'simple');
    if(detail) detail.classList.toggle('active', mode === 'detail');
  }
  document.addEventListener('DOMContentLoaded', function(){
    var saved = localStorage.getItem('expense_view_mode') || 'simple';
    setMode(saved);
    var simple = $('simpleModeBtn');
    var detail = $('detailModeBtn');
    if(simple) simple.addEventListener('click', function(){setMode('simple');});
    if(detail) detail.addEventListener('click', function(){setMode('detail');});
  });
})();
