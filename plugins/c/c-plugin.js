// ============================================================
//  C BUILDER — C Language Plugin
//  Requires: plugin-api.js
// ============================================================

var BLOCKS={
  types:{label:"Types & Variables",color:"#4a9eff",icon:"T",blocks:[
    {id:"var_int",name:"int",preview:"int x = 0;",tpl:`int {name} = {val};`,fields:[{id:"name",l:"Nom",d:"x"},{id:"val",l:"Valeur",d:"0"}]},
    {id:"var_float",name:"float",preview:"float f = 0.0f;",tpl:`float {name} = {val}f;`,fields:[{id:"name",l:"Nom",d:"f"},{id:"val",l:"Valeur",d:"0.0"}]},
    {id:"var_double",name:"double",preview:"double d = 0.0;",tpl:`double {name} = {val};`,fields:[{id:"name",l:"Nom",d:"d"},{id:"val",l:"Valeur",d:"0.0"}]},
    {id:"var_char",name:"char",preview:"char c = 'a';",tpl:`char {name} = '{val}';`,fields:[{id:"name",l:"Nom",d:"c"},{id:"val",l:"Char",d:"a"}]},
    {id:"var_str",name:"char[] string",preview:'char s[64]="hello";',tpl:`char {name}[{sz}] = "{val}";`,fields:[{id:"name",l:"Nom",d:"s"},{id:"sz",l:"Taille",d:"64"},{id:"val",l:"Valeur",d:"hello"}]},
    {id:"var_const",name:"const",preview:"const int MAX=100;",tpl:`const {type} {name} = {val};`,fields:[{id:"type",l:"Type",d:"int"},{id:"name",l:"Nom",d:"MAX"},{id:"val",l:"Valeur",d:"100"}]},
    {id:"var_ptr",name:"pointeur *",preview:"int *ptr=NULL;",tpl:`{type} *{name} = {val};`,fields:[{id:"type",l:"Type",d:"int"},{id:"name",l:"Nom",d:"ptr"},{id:"val",l:"Init",d:"NULL"}]},
    {id:"var_arr",name:"tableau []",preview:"int arr[10];",tpl:`{type} {name}[{sz}];`,fields:[{id:"type",l:"Type",d:"int"},{id:"name",l:"Nom",d:"arr"},{id:"sz",l:"Taille",d:"10"}]},
    {id:"var_static",name:"static",preview:"static int n=0;",tpl:`static {type} {name} = {val};`,fields:[{id:"type",l:"Type",d:"int"},{id:"name",l:"Nom",d:"count"},{id:"val",l:"Valeur",d:"0"}]},
    {id:"var_extern",name:"extern",preview:"extern int g;",tpl:`extern {type} {name};`,fields:[{id:"type",l:"Type",d:"int"},{id:"name",l:"Nom",d:"global"}]},
  ]},
  structs:{label:"Structures & Unions",color:"#a855f7",icon:"S",blocks:[
    {id:"struct_def",name:"struct",preview:"struct Point{...};",tpl:`struct {name} {\n    {t1} {f1};\n    {t2} {f2};\n};`,fields:[{id:"name",l:"Nom",d:"Point"},{id:"t1",l:"Type 1",d:"int"},{id:"f1",l:"Champ 1",d:"x"},{id:"t2",l:"Type 2",d:"int"},{id:"f2",l:"Champ 2",d:"y"}]},
    {id:"typedef_struct",name:"typedef struct",preview:"typedef struct{}Name;",tpl:`typedef struct {\n    {t1} {f1};\n    {t2} {f2};\n} {name};`,fields:[{id:"name",l:"Typedef",d:"Point"},{id:"t1",l:"Type 1",d:"int"},{id:"f1",l:"Champ 1",d:"x"},{id:"t2",l:"Type 2",d:"int"},{id:"f2",l:"Champ 2",d:"y"}]},
    {id:"struct_inst",name:"instance struct",preview:"struct Point p={0,0};",tpl:`struct {type} {name} = {{init}};`,fields:[{id:"type",l:"Type",d:"Point"},{id:"name",l:"Var",d:"p"},{id:"init",l:"Init",d:"0, 0"}]},
    {id:"union_def",name:"union",preview:"union Data{int i;float f;};",tpl:`union {name} {\n    {t1} {f1};\n    {t2} {f2};\n};`,fields:[{id:"name",l:"Nom",d:"Data"},{id:"t1",l:"Type 1",d:"int"},{id:"f1",l:"Champ 1",d:"i"},{id:"t2",l:"Type 2",d:"float"},{id:"f2",l:"Champ 2",d:"f"}]},
    {id:"enum_def",name:"enum",preview:"enum Color{RED,GREEN};",tpl:`enum {name} {\n    {v1},\n    {v2},\n    {v3}\n};`,fields:[{id:"name",l:"Nom",d:"Color"},{id:"v1",l:"Val 1",d:"RED"},{id:"v2",l:"Val 2",d:"GREEN"},{id:"v3",l:"Val 3",d:"BLUE"}]},
    {id:"arrow",name:"accès ->",preview:"p->field=0;",tpl:`{ptr}->{field} = {val};`,fields:[{id:"ptr",l:"Pointeur",d:"p"},{id:"field",l:"Champ",d:"x"},{id:"val",l:"Valeur",d:"0"}]},
    {id:"dot",name:"accès .",preview:"s.field=0;",tpl:`{var}.{field} = {val};`,fields:[{id:"var",l:"Variable",d:"s"},{id:"field",l:"Champ",d:"x"},{id:"val",l:"Valeur",d:"0"}]},
  ]},
  control:{label:"Contrôle ⊞",color:"#f59e0b",icon:"⬦",blocks:[
    // Conteneurs
    {id:"for_loop",name:"for(...){}",preview:"for(int i=0;i<n;i++)",isContainer:true,
     tpl:`for ({init}; {cond}; {step}) {`,tplClose:`}`,
     fields:[{id:"init",l:"Init",d:"int i = 0"},{id:"cond",l:"Condition",d:"i < n"},{id:"step",l:"Pas",d:"i++"}]},
    {id:"while_loop",name:"while(...){}",preview:"while(cond){...}",isContainer:true,
     tpl:`while ({cond}) {`,tplClose:`}`,fields:[{id:"cond",l:"Condition",d:"x > 0"}]},
    {id:"do_while",name:"do{}while(...)",preview:"do{...}while(cond);",isContainer:true,
     tpl:`do {`,tplClose:`} while ({cond});`,fields:[{id:"cond",l:"Condition",d:"x > 0"}]},
    {id:"if_block",name:"if(...){}",preview:"if(cond){...}",isContainer:true,
     tpl:`if ({cond}) {`,tplClose:`}`,fields:[{id:"cond",l:"Condition",d:"x > 0"}]},
    {id:"if_else",name:"if/else",preview:"if(cond){}else{}",isContainer:true,
     tpl:`if ({cond}) {`,tplClose:`} else {\n    // ...\n}`,fields:[{id:"cond",l:"Condition",d:"x > 0"}]},
    {id:"if_elif",name:"if/else if/else",preview:"if...else if...",isContainer:true,
     tpl:`if ({c1}) {`,tplClose:`} else if ({c2}) {\n    // ...\n} else {\n    // ...\n}`,
     fields:[{id:"c1",l:"Cond 1",d:"x > 0"},{id:"c2",l:"Cond 2",d:"x == 0"}]},
    {id:"switch_block",name:"switch/case",preview:"switch(x){case...}",isContainer:true,
     tpl:`switch ({var}) {`,tplClose:`}`,fields:[{id:"var",l:"Variable",d:"x"}]},
    {id:"func_body",name:"fonction { }",preview:"int fn(int a, int b) { ... }",isContainer:true,
     tpl:`{ret} {name}({params}) {`,tplClose:`}`,
     fields:[{id:"ret",l:"Retour",d:"int"},{id:"name",l:"Nom",d:"process"},{id:"params",l:"Params",d:"int a, int b"}]},
    {id:"func_main",name:"main{}",preview:"int main(argc,argv){}",isContainer:true,
     tpl:`int main(int argc, char *argv[]) {`,tplClose:`    return 0;\n}`,fields:[]},
    // Simples
    {id:"case_block",name:"case:",preview:"case N: break;",tpl:`    case {val}:\n        {action}\n        break;`,fields:[{id:"val",l:"Valeur",d:"1"},{id:"action",l:"Action",d:"// ..."}]},
    {id:"default_block",name:"default:",preview:"default: break;",tpl:`    default:\n        {action}\n        break;`,fields:[{id:"action",l:"Action",d:"// ..."}]},
    {id:"return_stmt",name:"return",preview:"return val;",tpl:`return {val};`,fields:[{id:"val",l:"Valeur",d:"0"}]},
    {id:"break_stmt",name:"break",preview:"break;",tpl:`break;`,fields:[]},
    {id:"continue_stmt",name:"continue",preview:"continue;",tpl:`continue;`,fields:[]},
    {id:"goto_stmt",name:"goto",preview:"goto label;",tpl:`goto {label};`,fields:[{id:"label",l:"Label",d:"end"}]},
    {id:"label_stmt",name:"label:",preview:"label:",tpl:`{label}:`,fields:[{id:"label",l:"Label",d:"end"}]},
  ]},
  functions:{label:"Fonctions",color:"#22c55e",icon:"ƒ",blocks:[
    {id:"func_proto",name:"prototype",preview:"int fn(int a,int b);",tpl:`{ret} {name}({params});`,fields:[{id:"ret",l:"Retour",d:"int"},{id:"name",l:"Nom",d:"add"},{id:"params",l:"Params",d:"int a, int b"}]},
    {id:"func_void",name:"void fn(){}",preview:"void print(int x){}",tpl:`void {name}({params}) {\n    // corps\n}`,fields:[{id:"name",l:"Nom",d:"print"},{id:"params",l:"Params",d:"int x"}]},
    {id:"func_call",name:"appel fn",preview:"res=fn(a,b);",tpl:`{res} = {name}({args});`,fields:[{id:"res",l:"Résultat",d:"result"},{id:"name",l:"Fonction",d:"fn"},{id:"args",l:"Args",d:"a, b"}]},
    {id:"func_ptr",name:"pointeur fn",preview:"int(*fp)(int,int);",tpl:`{ret} (*{name})({params});`,fields:[{id:"ret",l:"Retour",d:"int"},{id:"name",l:"Nom",d:"fp"},{id:"params",l:"Params",d:"int, int"}]},
    {id:"func_recursive",name:"récursion",preview:"int fact(int n){...}",tpl:`{ret} {name}({params}) {\n    if ({base_cond}) return {base_val};\n    return {recursive_expr};\n}`,fields:[{id:"ret",l:"Retour",d:"int"},{id:"name",l:"Nom",d:"fact"},{id:"params",l:"Params",d:"int n"},{id:"base_cond",l:"Cas base",d:"n <= 1"},{id:"base_val",l:"Val base",d:"1"},{id:"recursive_expr",l:"Récursion",d:"n * fact(n - 1)"}]},
    {id:"func_inline",name:"inline fn",preview:"inline int sq(int x){}",tpl:`inline {ret} {name}({params}) {\n    return {body};\n}`,fields:[{id:"ret",l:"Retour",d:"int"},{id:"name",l:"Nom",d:"sq"},{id:"params",l:"Params",d:"int x"},{id:"body",l:"Corps",d:"x * x"}]},
  ]},
  memory:{label:"Mémoire & Pointeurs",color:"#ef4444",icon:"M",blocks:[
    {id:"malloc_b",name:"malloc",preview:"T*p=malloc(n*sizeof(T));",tpl:`{type} *{name} = ({type} *)malloc({n} * sizeof({type}));`,fields:[{id:"type",l:"Type",d:"int"},{id:"name",l:"Pointeur",d:"p"},{id:"n",l:"Nombre",d:"n"}]},
    {id:"calloc_b",name:"calloc",preview:"T*p=calloc(n,sizeof(T));",tpl:`{type} *{name} = ({type} *)calloc({n}, sizeof({type}));`,fields:[{id:"type",l:"Type",d:"int"},{id:"name",l:"Pointeur",d:"p"},{id:"n",l:"Nombre",d:"n"}]},
    {id:"realloc_b",name:"realloc",preview:"p=realloc(p,n*sizeof(T));",tpl:`{name} = ({type} *)realloc({name}, {n} * sizeof({type}));`,fields:[{id:"type",l:"Type",d:"int"},{id:"name",l:"Pointeur",d:"p"},{id:"n",l:"Nouveau n",d:"new_n"}]},
    {id:"free_b",name:"free",preview:"free(ptr);ptr=NULL;",tpl:`free({name});\n{name} = NULL;`,fields:[{id:"name",l:"Pointeur",d:"ptr"}]},
    {id:"memcpy_b",name:"memcpy",preview:"memcpy(dst,src,n*sizeof(T));",tpl:`memcpy({dst}, {src}, {n} * sizeof({type}));`,fields:[{id:"dst",l:"Dest",d:"dst"},{id:"src",l:"Src",d:"src"},{id:"n",l:"Nombre",d:"n"},{id:"type",l:"Type",d:"int"}]},
    {id:"memset_b",name:"memset",preview:"memset(ptr,0,sizeof(arr));",tpl:`memset({ptr}, {val}, sizeof({arr}));`,fields:[{id:"ptr",l:"Pointeur",d:"ptr"},{id:"val",l:"Valeur",d:"0"},{id:"arr",l:"Taille",d:"arr"}]},
    {id:"null_check",name:"NULL check",preview:"if(ptr==NULL){...}",isContainer:true,tpl:`if ({ptr} == NULL) {`,tplClose:`}`,fields:[{id:"ptr",l:"Pointeur",d:"ptr"}]},
    {id:"deref",name:"déréférencement",preview:"*ptr=42;",tpl:`*{ptr} = {val};`,fields:[{id:"ptr",l:"Pointeur",d:"ptr"},{id:"val",l:"Valeur",d:"42"}]},
    {id:"addr",name:"adresse &",preview:"int*p=&x;",tpl:`{type} *{ptr} = &{var};`,fields:[{id:"type",l:"Type",d:"int"},{id:"ptr",l:"Pointeur",d:"p"},{id:"var",l:"Variable",d:"x"}]},
    {id:"sizeof_op",name:"sizeof",preview:"sizeof(int)",tpl:`sizeof({type})`,fields:[{id:"type",l:"Type",d:"int"}]},
  ]},
  preprocessor:{label:"Préprocesseur",color:"#06b6d4",icon:"#",blocks:[
    {id:"inc_sys",name:"#include <...>",preview:"#include <stdio.h>",tpl:`#include <{h}>`,fields:[{id:"h",l:"Header",d:"stdio.h"}]},
    {id:"inc_loc",name:'#include "..."',preview:'#include "myfile.h"',tpl:`#include "{h}"`,fields:[{id:"h",l:"Fichier",d:"myfile.h"}]},
    {id:"def_const",name:"#define constante",preview:"#define MAX 100",tpl:`#define {name} {val}`,fields:[{id:"name",l:"Nom",d:"MAX"},{id:"val",l:"Valeur",d:"100"}]},
    {id:"def_macro",name:"#define macro",preview:"#define MAX(a,b)...",tpl:`#define {name}({p1},{p2}) (({p1})>({p2})?({p1}):({p2}))`,fields:[{id:"name",l:"Nom",d:"MAX"},{id:"p1",l:"Param 1",d:"a"},{id:"p2",l:"Param 2",d:"b"}]},
    {id:"ifndef_guard",name:"#ifndef guard",preview:"#ifndef H_H...#endif",tpl:`#ifndef {guard}\n#define {guard}\n\n// contenu\n\n#endif /* {guard} */`,fields:[{id:"guard",l:"Guard",d:"MYHEADER_H"}]},
    {id:"ifdef_block",name:"#ifdef/#endif",preview:"#ifdef DEBUG...#endif",tpl:`#ifdef {macro}\n    // actif\n#else\n    // sinon\n#endif`,fields:[{id:"macro",l:"Macro",d:"DEBUG"}]},
    {id:"pragma_once",name:"#pragma once",preview:"#pragma once  (fichier .h)",tpl:`#pragma once`,fields:[]},
    {id:"undef",name:"#undef",preview:"#undef MACRO",tpl:`#undef {name}`,fields:[{id:"name",l:"Nom",d:"MACRO"}]},
  ]},
  io:{label:"Entrées / Sorties",color:"#84cc16",icon:"⇄",blocks:[
    {id:"printf_i",name:"printf",preview:'printf("%d\\n",x);',tpl:`printf("{fmt}\\n", {var});`,fields:[{id:"fmt",l:"Format",d:"%d"},{id:"var",l:"Variable",d:"x"}]},
    {id:"printf_s",name:"printf string",preview:'printf("%s\\n",s);',tpl:`printf("%s\\n", {var});`,fields:[{id:"var",l:"Variable",d:"str"}]},
    {id:"scanf_i",name:"scanf",preview:'scanf("%d",&x);',tpl:`scanf("{fmt}", &{var});`,fields:[{id:"fmt",l:"Format",d:"%d"},{id:"var",l:"Variable",d:"x"}]},
    {id:"fopen_b",name:"fopen",preview:'FILE*f=fopen("f","r");',tpl:`FILE *{var} = fopen("{file}", "{mode}");`,fields:[{id:"var",l:"Variable",d:"f"},{id:"file",l:"Fichier",d:"file.txt"},{id:"mode",l:"Mode",d:"r"}]},
    {id:"fclose_b",name:"fclose",preview:"fclose(f);",tpl:`fclose({var});`,fields:[{id:"var",l:"Fichier",d:"f"}]},
    {id:"fprintf_b",name:"fprintf",preview:'fprintf(f,"%d\\n",x);',tpl:`fprintf({file}, "{fmt}\\n", {var});`,fields:[{id:"file",l:"Fichier",d:"f"},{id:"fmt",l:"Format",d:"%d"},{id:"var",l:"Variable",d:"x"}]},
    {id:"fgets_b",name:"fgets",preview:"fgets(buf,sizeof(buf),f);",tpl:`fgets({buf}, sizeof({buf}), {file});`,fields:[{id:"buf",l:"Buffer",d:"buf"},{id:"file",l:"Fichier",d:"f"}]},
    {id:"perror_b",name:"perror",preview:'perror("err");',tpl:`perror("{msg}");`,fields:[{id:"msg",l:"Message",d:"erreur"}]},
  ]},
  operators:{label:"Opérateurs",color:"#f97316",icon:"∑",blocks:[
    {id:"ternary",name:"ternaire ?:",preview:"x>0?x:-x",tpl:`{cond} ? {vt} : {vf}`,fields:[{id:"cond",l:"Condition",d:"x > 0"},{id:"vt",l:"Si vrai",d:"x"},{id:"vf",l:"Si faux",d:"-x"}]},
    {id:"cast",name:"cast (type)",preview:"(float)x/y",tpl:`({type}){expr}`,fields:[{id:"type",l:"Type",d:"float"},{id:"expr",l:"Expr",d:"x"}]},
    {id:"bitand",name:"AND &",preview:"r=a&b;",tpl:`{r} = {a} & {b};`,fields:[{id:"r",l:"Résultat",d:"result"},{id:"a",l:"A",d:"a"},{id:"b",l:"B",d:"b"}]},
    {id:"bitor",name:"OR |",preview:"r=a|b;",tpl:`{r} = {a} | {b};`,fields:[{id:"r",l:"Résultat",d:"result"},{id:"a",l:"A",d:"a"},{id:"b",l:"B",d:"b"}]},
    {id:"bitxor",name:"XOR ^",preview:"r=a^b;",tpl:`{r} = {a} ^ {b};`,fields:[{id:"r",l:"Résultat",d:"result"},{id:"a",l:"A",d:"a"},{id:"b",l:"B",d:"b"}]},
    {id:"shl",name:"shift <<",preview:"r=x<<2;",tpl:`{r} = {v} << {n};`,fields:[{id:"r",l:"Résultat",d:"result"},{id:"v",l:"Valeur",d:"x"},{id:"n",l:"Bits",d:"2"}]},
    {id:"shr",name:"shift >>",preview:"r=x>>2;",tpl:`{r} = {v} >> {n};`,fields:[{id:"r",l:"Résultat",d:"result"},{id:"v",l:"Valeur",d:"x"},{id:"n",l:"Bits",d:"2"}]},
    {id:"assign_op",name:"affectation",preview:"x+=1;",tpl:`{var} {op} {val};`,fields:[{id:"var",l:"Variable",d:"x"},{id:"op",l:"Op",d:"+="},{id:"val",l:"Valeur",d:"1"}]},
    {id:"comment_s",name:"commentaire //",preview:"// texte",tpl:`// {text}`,fields:[{id:"text",l:"Texte",d:"commentaire"}]},
    {id:"comment_b",name:"/* bloc */",preview:"/* texte */",tpl:`/* {text} */`,fields:[{id:"text",l:"Texte",d:"description"}]},
    {id:"comment_sec",name:"=== section ===",preview:"/* === SECTION === */",tpl:`/* ====== {text} ====== */`,fields:[{id:"text",l:"Titre",d:"SECTION"}]},
  ]},
};


// ============================================================
// HEADER (.h) BLOCKS
// ============================================================
var H_BLOCKS = {
  header:{label:"Header .h",color:"#a855f7",icon:"H",blocks:[
    {id:"h_pragma",name:"#pragma once",preview:"#pragma once",tpl:"#pragma once",fields:[]},
    {id:"h_guard",name:"include guard",preview:"#ifndef X_H ... #endif",tpl:"#ifndef {guard}\n#define {guard}\n\n/* contenu */\n\n#endif /* {guard} */",fields:[{id:"guard",l:"Guard",d:"MYLIB_H"}]},
    {id:"h_opaque",name:"déclaration opaque",preview:"typedef struct Name Name;",tpl:"typedef struct {name} {name};",fields:[{id:"name",l:"Nom struct",d:"MyStruct"}]},
    {id:"h_typedef_struct",name:"typedef struct",preview:"typedef struct { } Name;",tpl:"typedef struct {\n    {t1} {f1};\n    {t2} {f2};\n} {name};",fields:[{id:"name",l:"Typedef",d:"Point"},{id:"t1",l:"Type 1",d:"int"},{id:"f1",l:"Champ 1",d:"x"},{id:"t2",l:"Type 2",d:"int"},{id:"f2",l:"Champ 2",d:"y"}]},
    {id:"h_proto",name:"prototype fonction",preview:"int fn(int a, int b);",tpl:"{ret} {name}({params});",fields:[{id:"ret",l:"Retour",d:"int"},{id:"name",l:"Nom",d:"my_func"},{id:"params",l:"Params",d:"int a, int b"}]},
    {id:"h_extern",name:"extern variable",preview:"extern int global;",tpl:"extern {type} {name};",fields:[{id:"type",l:"Type",d:"int"},{id:"name",l:"Nom",d:"g_counter"}]},
    {id:"h_define",name:"#define constante",preview:"#define MAX 100",tpl:"#define {name} {val}",fields:[{id:"name",l:"Nom",d:"MAX_SIZE"},{id:"val",l:"Valeur",d:"100"}]},
    {id:"h_macro",name:"#define macro fn",preview:"#define MAX(a,b) ...",tpl:"#define {name}({p1},{p2}) (({p1})>({p2})?({p1}):({p2}))",fields:[{id:"name",l:"Nom",d:"MAX"},{id:"p1",l:"Param 1",d:"a"},{id:"p2",l:"Param 2",d:"b"}]},
    {id:"h_macro_multi",name:"macro multiligne",preview:"#define SQUARE(x) ...",tpl:"#define {name}({param}) \\\n    ({body})",fields:[{id:"name",l:"Nom",d:"SQUARE"},{id:"param",l:"Param",d:"x"},{id:"body",l:"Corps",d:"(x)*(x)"}]},
    {id:"h_enum",name:"typedef enum",preview:"typedef enum { A, B } Name;",tpl:"typedef enum {\n    {v1},\n    {v2},\n    {v3}\n} {name};",fields:[{id:"name",l:"Nom",d:"Status"},{id:"v1",l:"Val 1",d:"STATUS_OK"},{id:"v2",l:"Val 2",d:"STATUS_ERR"},{id:"v3",l:"Val 3",d:"STATUS_PENDING"}]},
    {id:"h_include_sys",name:"#include <...>",preview:"#include <stdlib.h>",tpl:"#include <{h}>",fields:[{id:"h",l:"Header",d:"stdlib.h"}]},
    {id:"h_include_loc",name:"#include local",preview:'#include "other.h"',tpl:'#include "{h}"',fields:[{id:"h",l:"Fichier",d:"utils.h"}]},
    {id:"h_comment_sec",name:"section commentaire",preview:"/* === SECTION === */",tpl:"/* ==============================\n * {text}\n * ============================== */",fields:[{id:"text",l:"Titre",d:"Types publics"}]},
    {id:"h_fn_ptr_typedef",name:"typedef fn pointer",preview:"typedef int (*Fn)(int, int);",tpl:"typedef {ret} (*{name})({params});",fields:[{id:"ret",l:"Retour",d:"int"},{id:"name",l:"Nom type",d:"Callback"},{id:"params",l:"Params",d:"int, int"}]},
  ]},
};

var MK_BLOCKS = {
  makefile:{label:"Makefile",color:"#84cc16",icon:"MK",blocks:[
    {id:"mk_cc",name:"CC = gcc",preview:"CC = gcc",tpl:"CC = {val}",fields:[{id:"val",l:"Compilateur",d:"gcc"}]},
    {id:"mk_cflags",name:"CFLAGS",preview:"CFLAGS = -Wall -std=c11",tpl:"CFLAGS = {val}",fields:[{id:"val",l:"Flags",d:"-Wall -Wextra -std=c11 -O2"}]},
    {id:"mk_target",name:"TARGET",preview:"TARGET = mon_prog",tpl:"TARGET = {val}",fields:[{id:"val",l:"Nom exe",d:"mon_prog"}]},
    {id:"mk_srcs",name:"SRCS",preview:"SRCS = main.c utils.c",tpl:"SRCS = {val}",fields:[{id:"val",l:"Sources",d:"main.c"}]},
    {id:"mk_objs",name:"OBJS",preview:"OBJS = $(SRCS:.c=.o)",tpl:"OBJS = $(SRCS:.c=.o)",fields:[]},
    {id:"mk_all",name:"règle all",preview:"all: $(TARGET)",tpl:"all: $(TARGET)",fields:[]},
    {id:"mk_link",name:"règle link",preview:"$(TARGET): $(OBJS)",tpl:"$(TARGET): $(OBJS)\n\t$(CC) $(CFLAGS) -o $@ $^",fields:[]},
    {id:"mk_compile",name:"règle .c → .o",preview:"%.o: %.c",tpl:"%.o: %.c\n\t$(CC) $(CFLAGS) -c $< -o $@",fields:[]},
    {id:"mk_clean",name:"règle clean",preview:"clean: rm -f *.o",tpl:"clean:\n\trm -f $(OBJS) $(TARGET)",fields:[]},
    {id:"mk_custom",name:"target personnalisé",preview:"nom: deps",tpl:"{name}: {deps}\n\t{cmd}",fields:[{id:"name",l:"Target",d:"test"},{id:"deps",l:"Dépend",d:"$(TARGET)"},{id:"cmd",l:"Commande",d:"./$(TARGET)"}]},
    {id:"mk_phony",name:".PHONY",preview:".PHONY: all clean",tpl:".PHONY: {targets}",fields:[{id:"targets",l:"Targets",d:"all clean"}]},
    {id:"mk_libs",name:"LIBS",preview:"LIBS = -lm",tpl:"LIBS = {val}",fields:[{id:"val",l:"Librairies",d:"-lm"}]},
    {id:"mk_inc",name:"INCLUDES",preview:"INCLUDES = -I./include",tpl:"INCLUDES = {val}",fields:[{id:"val",l:"Includes",d:"-I./include"}]},
    {id:"mk_comment",name:"# commentaire",preview:"# commentaire",tpl:"# {text}",fields:[{id:"text",l:"Texte",d:"Règles de compilation"}]},
    {id:"mk_full",name:"Makefile complet",preview:"Template Makefile complet",tpl:"CC = {cc}\nCFLAGS = {flags}\nTARGET = {target}\nSRCS = {srcs}\nOBJS = $(SRCS:.c=.o)\n\n.PHONY: all clean\n\nall: $(TARGET)\n\n$(TARGET): $(OBJS)\n\t$(CC) $(CFLAGS) -o $@ $^\n\n%.o: %.c\n\t$(CC) $(CFLAGS) -c $< -o $@\n\nclean:\n\trm -f $(OBJS) $(TARGET)",fields:[{id:"cc",l:"Compilateur",d:"gcc"},{id:"flags",l:"Flags",d:"-Wall -Wextra -std=c11"},{id:"target",l:"Exe",d:"mon_prog"},{id:"srcs",l:"Sources",d:"main.c"}]},
  ]},
};



// ── C Syntax Highlighter ──────────────────────────────────────
var C_KW=new Set(['auto','break','case','char','const','continue','default','do','double','else','enum','extern','float','for','goto','if','inline','int','long','register','restrict','return','short','signed','sizeof','static','struct','switch','typedef','union','unsigned','void','volatile','while']);
var C_TY=new Set(['int','float','double','char','void','long','short','unsigned','signed','size_t','uint8_t','uint16_t','uint32_t','uint64_t','int8_t','int16_t','int32_t','int64_t','bool','FILE','NULL','true','false','ptrdiff_t']);
var C_STD=new Set(['printf','fprintf','sprintf','snprintf','scanf','fscanf','malloc','calloc','realloc','free','memcpy','memmove','memset','strlen','strcpy','strcat','strcmp','fopen','fclose','fread','fwrite','fgets','fputs','exit','abort','atoi','atof','rand','srand','getchar','putchar']);
function hlC(code){
  if(!code)return'';
  return code.split('\n').map(function(line){
    if(/^\s*#/.test(line))return'<span class="cp">'+escH(line)+'</span>';
    var ci=-1;
    for(var i=0;i<line.length-1;i++){if(line[i]==='/'&&line[i+1]==='/'){ci=i;break;}}
    var co=ci>=0?line.slice(0,ci):line;
    var cm=ci>=0?'<span class="cc">'+escH(line.slice(ci))+'</span>':'';
    return cTok(co)+cm;
  }).join('\n');
}
function cTok(code){
  var r='',i=0;
  while(i<code.length){
    if(code[i]==='"'){var j=i+1;while(j<code.length&&!(code[j]==='"'&&code[j-1]!=='\\'))j++;r+='<span class="cs">'+escH(code.slice(i,j+1))+'</span>';i=j+1;continue;}
    if(code[i]==="'"&&i+2<code.length){var j=i+1;while(j<code.length&&!(code[j]==="'"&&code[j-1]!=='\\'))j++;r+='<span class="cs">'+escH(code.slice(i,j+1))+'</span>';i=j+1;continue;}
    if(/[0-9]/.test(code[i])){var j=i+1;while(j<code.length&&/[0-9a-fA-FxXuUlLfF.]/.test(code[j]))j++;r+='<span class="cn">'+escH(code.slice(i,j))+'</span>';i=j;continue;}
    if(/[a-zA-Z_]/.test(code[i])){
      var j=i+1;while(j<code.length&&/[a-zA-Z0-9_]/.test(code[j]))j++;
      var w=code.slice(i,j);var isFn=code.slice(j).trimStart().startsWith('(');
      if(C_TY.has(w))r+='<span class="ct">'+escH(w)+'</span>';
      else if(C_KW.has(w))r+='<span class="ck">'+escH(w)+'</span>';
      else if(isFn||C_STD.has(w))r+='<span class="cf">'+escH(w)+'</span>';
      else if(/^[A-Z_][A-Z0-9_]+$/.test(w))r+='<span class="cm">'+escH(w)+'</span>';
      else r+=escH(w);
      i=j;continue;
    }
    r+=escH(code[i]);i++;
  }
  return r;
}

// ── C Validator ───────────────────────────────────────────────
function validateC(code, block) {
  var errors = [], warnings = [];
  var unresolved = code.match(/\{[a-zA-Z_]\w*\}/g);
  if(unresolved) {
    var u = unresolved.filter(function(v,i,a){return a.indexOf(v)===i;});
    errors.push('Champ(s) non rempli(s): ' + u.join(', '));
  }
  if(!block.isContainer) {
    var opens=(code.match(/\{/g)||[]).length, closes=(code.match(/\}/g)||[]).length;
    if(opens!==closes) warnings.push('Accolades déséquilibrées');
    var trimmed=code.trim();
    if(!trimmed.startsWith('#')&&!trimmed.startsWith('//')&&!trimmed.startsWith('/*')
       &&!trimmed.endsWith('{')&&!trimmed.endsWith('}')&&!trimmed.endsWith(';')) {
      if(/^(int|float|double|char|void|long|short|unsigned|static|extern|const|return|free|memset|printf|scanf)/.test(trimmed))
        warnings.push('Point-virgule manquant?');
    }
  }
  var po=(code.match(/\(/g)||[]).length, pc=(code.match(/\)/g)||[]).length;
  if(po!==pc) warnings.push('Parenthèses déséquilibrées');
  return {errors:errors, warnings:warnings};
}

// ── Register plugin ───────────────────────────────────────────
registerLanguage({
  id: 'c',
  name: 'C',
  icon: 'C',
  color: '#4a9eff',
  fileTypes: {
    c:  { label: 'C Source (.c)', blocks: BLOCKS },
    h:  { label: 'C Header (.h)', blocks: H_BLOCKS.header ? H_BLOCKS : {header: H_BLOCKS.header} },
    mk: { label: 'Makefile',      blocks: MK_BLOCKS.makefile ? MK_BLOCKS : {makefile: MK_BLOCKS.makefile} },
  },
  highlight: hlC,
  validate:  validateC,
  indent:    '    ',
  blockSep:  '\n',
});
