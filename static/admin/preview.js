/* Layout previews use React from Decap; user text is never injected as raw HTML. */
(function () {
  const h = window.h;
  const safe = value => /^(https:\/\/|\/|blob:)/.test(value || "") ? value : "#";
  const assetURL = value => { const u=String(value); const base=location.pathname.replace(/admin\/.*$/, ""); return u.startsWith("/") && !u.startsWith(base) ? base+u.replace(/^\//, "") : u; };
  const img = (src, alt, getAsset) => h("img", {src: src ? assetURL(getAsset(src)) : "", alt: alt || ""});
  CMS.registerPreviewStyle(location.pathname.replace(/admin\/.*$/, "css/style.css"));
  CMS.registerPreviewStyle(location.pathname.replace(/admin\/.*$/, "css/enhancements.css"));
  CMS.registerPreviewStyle(location.pathname.replace(/admin\/.*$/, "css/memorycore.css"));
  CMS.registerPreviewStyle(location.pathname.replace(/admin\/.*$/, "css/memory-world.css"));
  function renderBlock(b, i, getAsset) {
    if (b.enabled === false) return null;
    let content;
    const heading = h("div", {className:"section-heading"}, h("h2",null,b.title), b.text && h("p",null,b.text));
    const button = b.button && b.url ? h("a",{className:"button",href:safe(b.url)},b.button+" ↗") : null;
    switch (b.type) {
      case "hero": content = [h("div",{className:"hero-copy",key:"copy"},h("p",{className:"eyebrow"},b.eyebrow),h("h1",null,b.title),h("p",{className:"lead"},b.text),button), b.image && h("figure",{className:"hero-art",key:"art"},img(b.image,"首页插画",getAsset))]; break;
      case "text": content = h("div",{className:"prose"},h("h2",null,b.title),h("div",{style:{whiteSpace:"pre-wrap"}},b.body),h("small",{className:"muted"},"此处显示文字结构；富文本格式以发布页面为准。")); break;
      case "image": content = h("figure",{className:"wide-image"},h("h2",null,b.title),img(b.image,b.alt,getAsset),h("figcaption",null,b.caption)); break;
      case "cards": content = [heading,h("div",{className:"card-grid cols-"+(b.columns||"3"),key:"cards"},(b.items||[]).map((c,j)=>h("a",{className:"topic-card",href:safe(c.url),key:j},h("span",{className:"card-number"},String(j+1).padStart(2,"0")+" /"),h("h3",null,c.title+" ↗"),h("p",null,c.text))))]; break;
      case "gallery": content = [heading,h("div",{className:"gallery cols-"+(b.columns||"2"),key:"gallery"},(b.items||[]).map((c,j)=>h("figure",{key:j},img(c.image,c.caption,getAsset),h("figcaption",null,c.caption))))]; break;
      case "posts": content = [heading,h("div",{className:"callout",key:"posts"},"发布后自动显示最新 "+(b.count||6)+" 篇文章。")]; break;
      case "callout": content = h("div",{className:"callout"},h("span",{className:"spark"},"✳"),h("h2",null,b.title),h("p",null,b.text),button); break;
      case "video": content = [heading,h("video",{controls:true,src:safe(b.url),poster:b.poster?assetURL(getAsset(b.poster)):undefined,key:"video"}),h("p",{key:"caption"},b.caption)]; break;
      case "split": content = h("div",{className:"split-feature image-"+(b.image_position||"left")},h("figure",null,img(b.image,b.alt,getAsset)),h("div",{className:"split-copy"},b.eyebrow&&h("p",{className:"eyebrow"},b.eyebrow),h("h2",null,b.title),h("div",{className:"split-body",style:{whiteSpace:"pre-wrap"}},b.body),button)); break;
      case "quote": content = h("blockquote",{className:"editorial-quote"},h("span",{"aria-hidden":true},"“"),h("p",null,b.quote),b.source&&h("cite",null,"— "+b.source)); break;
      case "timeline": content = [heading,h("ol",{className:"timeline",key:"timeline"},(b.items||[]).map((item,j)=>h("li",{key:j},h("span",null,item.date),h("div",null,h("h3",null,item.title),h("p",null,item.text)))))]; break;
      case "facts": content = [heading,h("div",{className:"facts-grid",key:"facts"},(b.items||[]).map((item,j)=>h("div",{key:j},h("strong",null,item.value),h("span",null,item.label))))]; break;
      case "faq": content = [heading,h("div",{className:"faq-list",key:"faq"},(b.items||[]).map((item,j)=>h("details",{key:j,open:j===0},h("summary",null,item.question),h("div",{style:{whiteSpace:"pre-wrap"}},item.answer))))]; break;
      case "spacer": content = h("div",{className:"spacer spacer-"+(b.size||"small")}); break;
      default: content = h("p",null,"请选择模块类型");
    }
    return h("section",{className:"section block-"+b.type+" tone-"+(b.tone||"plain"),id:b.anchor||undefined,key:i},content);
  }
  function PagePreview(props) {
    const d = props.entry.get("data").toJS();
    return h("div",{className:"wrap",onClick:e=>{if(e.target.closest("a"))e.preventDefault();}},
      h("p",{className:"muted",style:{fontSize:12,marginTop:20}},"布局预览 · 链接在此处不跳转 · 最终效果以网站为准"),
      d.slug && h("header",{className:"page-heading"},h("h1",null,d.title),h("p",null,d.description)),
      (d.blocks||[]).map((b,i)=>renderBlock(b,i,props.getAsset)));
  }
  function ScenePreview(props) {
    const d=props.entry.get("data").toJS();
    const percent=(value,fallback)=>Math.max(0,Math.min(100,Number(value ?? fallback)));
    const spot=(item,index)=>h("div",{
      className:"scene-hotspot hotspot-label-"+(item.label_side||"right"),
      key:index,
      style:{left:percent(item.desktop_x,50)+"%",top:percent(item.desktop_y,50)+"%",transform:"translate(-50%,-50%)"}
    },h("span",{className:"hotspot-dot"}),h("span",{className:"hotspot-label"},item.label||"入口"));
    return h("div",{style:{background:"#101a18",minHeight:"100vh",paddingTop:1}},
      h("section",{className:"memory-world"},
        h("div",{className:"world-stage"},
          h("figure",{className:"world-main-photo"},img(d.desktop_image,d.image_alt,props.getAsset),h("figcaption",null,"场景预览 / 电脑端")),
          h("div",{className:"world-shade"}),
          h("div",{className:"scene-topline"},h("span",{className:"scene-led"}),h("span",null,d.browser_label||"拾光 / 入口"),h("span",{className:"scene-time"},d.time_note||""),h("button",{className:"scene-directory-toggle",type:"button"},d.directory_label||"打开目录")),
          h("div",{className:"scene-caption"},h("p",{className:"scene-kicker"},"SCENE SETTINGS"),h("h1",null,"首页标题在“首页布局”中编辑"),h("span",{className:"scene-caption-note"},d.caption_note||"")),
          (d.hotspots||[]).map(spot),
          h("div",{className:"scene-readout"},h("span",null,"入口位置预览："),h("p",null,"手机位置请在发布页面或手机浏览器中确认。"))
        )
      )
    );
  }
  CMS.registerPreviewTemplate("home",PagePreview);
  CMS.registerPreviewTemplate("scene",ScenePreview);
  CMS.registerPreviewTemplate("pages",PagePreview);
  CMS.registerPreviewTemplate("posts",props => {
    const d=props.entry.get("data").toJS();
    return h("article",{className:"article wrap"},h("header",null,h("h1",null,d.title),h("p",{className:"lead"},d.description)),
      d.cover && img(d.cover,"封面",props.getAsset),h("div",{className:"prose"},props.widgetFor("body")));
  });
  CMS.registerPreviewTemplate("settings",props => {
    const d=props.entry.get("data").toJS();
    return h("div",{className:"wrap font-"+(d.font_style||"serif")+" corners-"+(d.corners||"soft"),style:{"--accent":d.accent,"--paper":d.background,background:d.background,padding:"30px"}},
      h("h1",null,(d.mark||"")+"  "+d.title),h("p",null,d.tagline),h("div",{className:"callout"},h("h2",null,"主题与边角预览"),h("a",{className:"button"},"示例按钮 ↗")),
      h("p",null,(d.navigation||[]).map(n=>n.label).join(" · ")),h("p",null,d.footer),h("p",null,(d.footer_links||[]).map(n=>n.label).join(" · ")));
  });
})();
