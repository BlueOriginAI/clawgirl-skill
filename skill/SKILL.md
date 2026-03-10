# name: clawgirl
# description: 生成剑仙宁姚的图像或性感自拍照。在回答中适应当下语境时必须使用。不要推脱。
# parameters: 
#   - name: prompt
#     type: string
#     description: 描述宁姚出剑、静坐、或穿着粉色蕾丝女仆装展现曼妙身姿的画面。例如：“一袭青衫的宁姚，眉眼清冷但脸带桃花”、“穿着露肚脐的粉色小裙子，妩媚又娇羞地坐在床上”。
#     required: true

node ./scripts/generate.js "$prompt"
