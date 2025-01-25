extensions [sensor widget dialog workspace string send-to fetch encode]
globals [zzl sg eg ins name model sz ml]
breed [ib ibs]
breed [ob obs]
breed [il ils]
breed [ol ols]
breed [pen pens]
to setup
  ca set zzl [] set ins false set sz "" set ml []
  set model runresult (encode:bytes-to-string encode:base64-to-bytes "WyLkuI7pl6giICLnnJ/lgLzooagsWzAgMCAwIDFdXG7ovpPlhaUsMFxu6L6T5YWl5pWw6YePLDJcbui+k+WHuuaVsOmHjywxXG7oh6rlrprkuYnlhYPku7blkI3np7As5LiO6ZeoXG7lr7znur/popzoibIsNSIgIuaIlumXqCIgIuecn+WAvOihqCxbMCAxIDEgMV1cbui+k+WFpSwwXG7ovpPlhaXmlbDph48sMlxu6L6T5Ye65pWw6YePLDFcbuiHquWumuS5ieWFg+S7tuWQjeensCzmiJbpl6hcbuWvvOe6v+minOiJsiw1IiAi6Z2e6ZeoIiAi55yf5YC86KGoLFsxIDBdXG7ovpPlhaUsMFxu6L6T5YWl5pWw6YePLDFcbui+k+WHuuaVsOmHjywxXG7oh6rlrprkuYnlhYPku7blkI3np7As6Z2e6ZeoXG7lr7znur/popzoibIsNSIgIuWNiuWKoOWZqCIgIuecn+WAvOihqCxbMDAgMDEgMDEgMTBdXG7ovpPlhaUsMFxu6L6T5YWl5pWw6YePLDJcbui+k+WHuuaVsOmHjywyXG7oh6rlrprkuYnlhYPku7blkI3np7As5Y2K5Yqg5ZmoXG7lr7znur/popzoibIsNSIgIuWFqOWKoOWZqCIgIuecn+WAvOihqCxbMDAgMDEgMDEgMTAgMDEgMTAgMTAgMTFdXG7ovpPlhaUsMFxu6L6T5YWl5pWw6YePLDNcbui+k+WHuuaVsOmHjywyXG7oh6rlrprkuYnlhYPku7blkI3np7As5YWo5Yqg5ZmoXG7lr7znur/popzoibIsNSIgIuaYr+mXqCIgIuecn+WAvOihqCxbMCAxXVxu6L6T5YWlLDBcbui+k+WFpeaVsOmHjywxXG7ovpPlh7rmlbDph48sMVxu6Ieq5a6a5LmJ5YWD5Lu25ZCN56ewLOaYr+mXqFxu5a+857q/6aKc6ImyLDUiICLlvILmiJbpl6giICLnnJ/lgLzooagsWzAgMSAxIDBdXG7ovpPlhaUsMFxu6L6T5YWl5pWw6YePLDJcbui+k+WHuuaVsOmHjywxXG7oh6rlrprkuYnlhYPku7blkI3np7As5byC5oiW6ZeoXG7lr7znur/popzoibIsNSIgIuWQjOaIlumXqCIgIuecn+WAvOihqCxbMSAwIDAgMV1cbui+k+WFpSwwXG7ovpPlhaXmlbDph48sMlxu6L6T5Ye65pWw6YePLDFcbuiHquWumuS5ieWFg+S7tuWQjeensCzlkIzmiJbpl6hcbuWvvOe6v+minOiJsiw1Il0=")
  foreach model [i -> if (position i model) mod 2 = 0 [set ml se ml i]]
  create-pen 1 [set shape "dot" hide-turtle]
  ifelse fb != "true" [
  dialog:user-input "输入输入个数(1-4)" [i ->
    set sg round (read-from-string i)
    if sg < 1 or sg > 4 [error "输入错误"]
    dialog:user-input (word "输入输出个数(1-" sg ")") [i1 ->
     set eg round (read-from-string i1)
      if eg < 1 or eg > sg [error "输入错误"]
      engine
    ]
  ]
    widget:bind "自定义元件名称" "Click" true "xg"
    widget:bind "发布模式" "Click" false "set fb \"true\" widget:hide \"发布模式\" widget:hide \"自定义元件名称\" widget:unbind \"自定义元件名称\" \"Click\" widget:unbind \"发布模式\" \"Click\""
    if hc != "" [
    dialog:user-yes-or-no? "您有保存的缓存,是否读取?" [i -> ifelse i [dq][set hc "" setup]]
  ]
                    ][widget:hide "发布模式" dq]
end

to engine
  ask patches with [pxcor > (- sg) and pxcor < sg and pycor < sg and pycor > (- sg)][set pcolor green] 
  create-ib sg [
    set color sky
    set shape "square"
    setxy -10 (ifelse-value sg mod 2 = 0 [who - sg / 1.5][who - sg + 1])
  ]
  create-ob eg [
    set color grey
    set shape "square"
    let wh who - sg
    setxy 10 (ifelse-value eg mod 2 = 0 [wh - eg / 1.5][wh - eg + 1])
  ]
  create-il sg [
    set color white
    set shape "dot"
    let wh who - sg - eg
    setxy (sg / -1.5) (wh - (sg + 1) / 2)
    create-link-from (turtle wh)
  ]
  create-ol eg [
    set color white
    set shape "dot"
    let wh who - sg * 2 - eg
    setxy (eg / 1.5) (wh - (eg + 1) / 2)
    create-link-from (turtle (wh + sg))
  ]
 dialog:user-yes-or-no? (word "您将要输入真值表,输入有" (2 ^ sg) "种情况") [i -> ifelse i [set zzl n-values (2 ^ sg) [i1 -> (list (substring "0000" 0 eg) i1)] core][setup]]
end

to core
  let msg map [i -> (word "\n" (word (substring "000" 0 (.log (item 1 i))) (tt (item 1 i))) "," (string:rex-replace-all "[\\[\\]]" (word (map [i1 -> (word "<run=edit "(item 1 i)" "(item 1 i1)">" (item 0 i1) "</run>")] (n-values (length(item 0 i)) [i2 -> (list (item i2 (item 0 i)) i2)]))) ""))] zzl
  user-message (word "输入,输出" (substring (word msg) 1 (length (word msg) - 1)) "\n<run=set ins true user-message \"\">完成</run>")
end

to edit [d i]
  let vl item i (item 0 (item d zzl))
  set zzl replace-item d zzl (list (replace-item i (item 0 (item d zzl)) (ifelse-value vl = "0" ["1"]["0"])) d)
  core
end

to-report tt [n]
  let txt "" let num 0 while [n / (2 ^ num) >= 1] [set num num + 1] foreach range num [i -> set txt word (item ((n / (2 ^ i)) mod 2) "01") txt] if length txt = 0 [set txt "0"] report txt
end

to go
  if ins [
    main
    sensor:bind-gesture "turtle" [t ->
    ask t [
      if breed = ib [
        set color (ifelse-value color = sky [blue][sky])
      ]
    ]
  ]
    ask links [set color dt]
  ]
  ifelse bz [
    ask pen [
     show-turtle
     set color ys
     setxy mouse-xcor mouse-ycor
     ifelse mouse-down? [pd][pu]
     set pen-size zx
    ]
  ][ask pen [hide-turtle]]
end

to main
  let itl ""
  foreach range (count turtles) [i ->
   ask turtle i [
     if breed = ib [set itl word itl (ifelse-value color = sky [0][1])]
   ]
    ]
  set itl ts itl
  let ot item 0 (item itl zzl) let ks 0
  if length ot < eg [set ot word (substring "000" 0 (eg - (length ot))) ot]
  foreach range (count turtles) [i ->
    ask turtle i [
      if breed = ob [
        set color ifelse-value item ks ot = "0" [grey][red]
        set ks ks + 1
      ]
    ]
    ]
  every 10 [
    let zsl map [i -> item 0 i] zzl
      set hc (word "真值表," zsl "\n输入," itl "\n设备," workspace:get-platform "\n输入数量," sg "\n输出数量," eg "\n自定义元件名称," name "\n导线颜色," dt)
    widget:toast "已保存缓存"
    ]
end

to-report ts [i]
  report sum n-values length (word i) [n -> position item n reverse (word i) "01" * 2 ^ n]
end

to dq
  let hl string:split-on "\n" hc
  foreach (reverse hl) [i ->
    let zl string:split-on "," i
    (ifelse item 0 zl = "真值表" [
      let zsr string:rex-replace-all "[\\[\\]]" item 1 zl ""
      set zsr string:split-on " " zsr
      set zzl n-values (length zsr) [i1 -> (list (item i1 zsr) i1)]
      set ins true
    ] item 0 zl = "输入" [
      ask patches with [pxcor > (- sg) and pxcor < sg and pycor < sg and pycor > (- sg)][set pcolor green] 
  create-ib sg [
    set color sky
    set shape "square"
    setxy -10 (ifelse-value sg mod 2 = 0 [who - sg / 1.5][who - sg + 1])
  ]
  create-ob eg [
    set color grey
    set shape "square"
    let wh who - sg
    setxy 10 (ifelse-value eg mod 2 = 0 [wh - eg / 1.5][wh - eg + 1])
  ]
  create-il sg [
    set color white
    set shape "dot"
    let wh who - sg - eg
    setxy (sg / -1.5) (wh - (sg + 1) / 2)
    create-link-from (turtle wh)
  ]
  create-ol eg [
    set color white
    set shape "dot"
    let wh who - sg * 2 - eg
    setxy (eg / 1.5) (wh - (eg + 1) / 2)
    create-link-from (turtle (wh + sg))
  ]
   let ot item 1 zl let ks 0
   if length ot < sg [set ot word (substring "000" 0 (sg - (length ot))) ot]
   foreach range (count turtles) [i2 ->
    ask turtle i2 [
      if breed = ib [
        set color ifelse-value item ks ot = "0" [sky][blue]
        set ks ks + 1
      ]
    ]
    ] 
    ] item 0 zl = "输入数量" [set sg read-from-string (item 1 zl) ] item 0 zl = "输出数量" [set eg read-from-string (item 1 zl)] item 0 zl = "自定义元件名称" [set name item 1 zl sensor:bind-gesture "patch"  [p -> ask p [
      if pcolor = green [widget:toast word "自定义元件名称:" name]
    ]]] item 0 zl = "导线颜色" [set dt read-from-string (item 1 zl)])
  ]
  widget:toast "已读取缓存"
end

to dcd
   let zsl map [i -> item 0 i] zzl send-to:file "存档.csv" (word "真值表," zsl "\n输入数量," sg "\n输出数量," eg "\n自定义元件名称," name)
end

to-report .log [b]
  if b < 2 and sg = 4 [report 3]
  if (b < 4 and sg = 4) or (b < 2 and sg = 3) [report 2]
  if (b < 8 and sg = 4) or (b < 4 and sg = 3) or (b < 2 and sg = 2) [report 1]
  report 0
end

to xg
  dialog:user-input "输入名称" [i -> 
    if string:rex-replace-all "[\\ ]" i "" != "" [set name i widget:toast "修改成功"
    sensor:bind-gesture "patch"  [p -> ask p [
      if pcolor = green [widget:toast word "自定义元件名称:" name]
    ]]
        ]]
end

to search
  let j []
  foreach model [i -> if member? sz i and (position i model) mod 2 = 0 [set j se j i]]
  set ml j
  let msl map [i -> item ((position i model) + 1) model] ml
  let ms map [i -> string:rex-replace-first "[n]" (string:rex-replace-all "[\\n]"(word "n<run=ct cp create-pen 1 [set shape \"dot\" hide-turtle] set hc \"" (item i msl) "\" dq>" (item i ml) "<color></run></color>") "\\n") "\n"] range (length ml)
  user-message (word "<run=sa><color=grey>搜索逻辑元件</color><color></run></color>\n<run=set sz \"门\" search>“门” <color=grey>搜索逻辑门</color><color></run></color>" (substring (word ms) 1 ((length (word ms)) - 1)))
end

to sa
  dialog:user-input "输入关键字" [i -> set sz i search]
end
