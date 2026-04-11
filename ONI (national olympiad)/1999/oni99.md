\# Olimpiada Naþionalã de Informaticã - Mediaº, 1999



\# SOLUÞIILE problemelor propuse



În numãrul 5/1999 al GInfo am publicat cele 24 de probleme de la ONI ‘99, organizatã la Mediaº. Redacþia GInfo, preocupatã de a vã oferi posibilitatea de a "creºte" mereu, vã prezintã rezolvãrile unora dintre ele.



\---



\## P059901: Expresie



\*Sabãu Florin, clasa a XI-a, Reºiþa\*



Procedura Eval realizeazã evaluarea expresiei. Aceasta defalcã expresia stocatã în variabila exp în pãrþile componente:



\* mai întâi operatorii - în vectorul o

\* apoi constantele numerice ºi variabilele - în vectorul op



Urmeazã evaluarea propriu-zisã în doi paºi:



\* înmulþirea;

\* adunarea ºi scãderea.



\### Listing: `expresie.pas`



```pascal

var exp:string;

&#x20;   v:array\['a'..'e'] of Longint;

&#x20;   e:array\['a'..'e'] of Boolean;

&#x20;   op:array\[1..255] of Comp;

&#x20;   o:array\[1..255] of Char;

&#x20;   i:Integer;

&#x20;   s:Comp;



function s2i(s:string):Longint;

var i:Longint;

&#x20;   code:Integer;

begin

&#x20; val(s,i,code);

&#x20; s2i:=i

end;



procedure citeste;

var s:string;

&#x20;   c:Char;

begin

&#x20; Assign(input,'EX.IN'); Reset(input);

&#x20; Readln(exp);

&#x20; Fillchar(e,Sizeof(e),0);

&#x20; i:=0;

&#x20; while not Eof do

&#x20; begin

&#x20;   Inc(i);

&#x20;   Readln(s);

&#x20;   c:=s\[1];

&#x20;   v\[c]:=s2i(Copy(s,3,Length(s)-2));

&#x20;   e\[c]:=true

&#x20; end;

&#x20; Close(input);

&#x20; Assign(output,'EX.OUT');

&#x20; Rewrite(output)

end;



function nedefinita:Boolean;

begin

&#x20; nedefinita:=false;

&#x20; for i:=1 to Length(exp) do

&#x20;   if (exp\[i] in \['a'..'e']) and (e\[exp\[i]]=false)

&#x20;   then

&#x20;   begin nedefinita:=true; Break end

end;



function eval:string;

var vec,i,n,m,k:Integer;

&#x20;   sw:Comp;

begin

&#x20; i:=1;

&#x20; n:=0; m:=0;

&#x20; o\[1]:='+';

&#x20; while i<=Length(exp) do

&#x20; begin

&#x20;   vec:=i;

&#x20;   while not (exp\[i] in \['a'..'e','+','-'])

&#x20;        and (i<=Length(exp)) do i:=i+1;

&#x20;   if (vec<>i)

&#x20;   then

&#x20;   begin

&#x20;     Inc(n);

&#x20;     op\[n]:=s2i(Copy(exp,vec,i-vec));

&#x20;     if i<=Length(exp)

&#x20;     then

&#x20;     if exp\[i] in \['a'..'e']

&#x20;     then o\[n+1]:='\*'

&#x20;     else begin o\[n+1]:=exp\[i]; Inc(i) end

&#x20;   end;

&#x20;   vec:=i;

&#x20;   while (exp\[i] in \['a'..'e']) and i<=Length(exp)) do

&#x20;   begin

&#x20;     Inc(n);

&#x20;     op\[n]:=v\[exp\[i]];

&#x20;     o\[n+1]:='\*';

&#x20;     Inc(i)

&#x20;   end;

&#x20;   if (vec<>i)

&#x20;   then

&#x20;   begin

&#x20;     if exp\[i] in \['0'..'9']

&#x20;     then o\[n+1]:='\*'

&#x20;     else begin o\[n+1]:=exp\[i]; Inc(i) end

&#x20;   end

&#x20; end;

&#x20; o\[n+1]:=#0;

&#x20; i:=1;

&#x20; while i<=n do      { Pasul 1 - Inmultirea }

&#x20; begin

&#x20;   vec:=i;

&#x20;   while (o\[i+1]='\*') and (i<=n) do i:=i+1;

&#x20;   if (i<=n)

&#x20;   then

&#x20;   begin

&#x20;     sw:=1;

&#x20;     for k:=vec to i do

&#x20;     begin

&#x20;       sw:=sw\*op\[k];

&#x20;       if k<>vec then o\[k]:=#0

&#x20;     end;

&#x20;     op\[vec]:=sw

&#x20;   end;

&#x20;   while (o\[i+1]<>'\*') and (i<=n) do i:=i+1

&#x20; end;

&#x20; s:=0;

&#x20; for i:=1 to n do

&#x20;   if o\[i]='+'

&#x20;   then s:=s+op\[i]

&#x20;   else

&#x20;     if o\[i]='-'

&#x20;     then s:=s-op\[i];

&#x20;   Writeln(s:0:0)

end;



Begin

&#x20; citeste;

&#x20; if nedefinita

&#x20; then Writeln('NEDEFINITA')

&#x20; else eval;

&#x20; Close(output)

End.

```



\---



\## P059902: Nasturi



\*Sabãu Florin, clasa a XI-a, Reºiþa\*



Problema nu are soluþie pentru urmãtoarele seturi de date:



\* numãrul de nasturi (x) este impar;

\* numãrul de nasturi de extras este cu 2 mai mic decât numãrul total de nasturi (n\*n);

\* numãrul de nasturi de extras este mai mic decât 4 (=2).



Dacã nici una dintre condiþii nu este îndeplinitã atunci avem soluþie. Dacã numãrul x este divizibil cu 4 atunci simpla extragere a unor grupuri de nasturi de câte 4 este suficientã.



```text

..

..

```



Dacã nu, se extrag câte 4 nasturi pânã când mai rãmân 6. Aceºtia ºase sunt extraºi din colþul din dreapta-jos al matricei în felul urmãtor:



```text

o..

.o.

..o

```



ori, dacã antepenultima linie a matricei este ocupatã în întregime, avem:



```text

\-....

\-..oo

\-.oo.

\-.o.o

```



( `'.'` reprezintã locul de unde se extrag nasturi, iar `'o'` nasturi neextraºi).



\### Listing: `NASTURI.PAS`



```pascal

var n,x,i,j:Integer;

&#x20;   a:array\[1..31,1..31] of Char;

&#x20;   gata:Boolean;



procedure citeste;

begin

&#x20; Assign(input,'NASTURI.IN'); Reset(input);

&#x20; Readln(n,x); Close(input);

&#x20; Assign(output,'NASTURI.OUT'); Rewrite(output)

end;



Begin

&#x20; citeste;

&#x20; if (x mod 2<>0) or (x>=n\*n-2) or (x<4)

&#x20; then Writeln('fara solutie')

&#x20; else begin

&#x20;   Fillchar(a,Sizeof(a),'o');

&#x20;   gata:=false;

&#x20;   for i:=1 to n div 2 do

&#x20;     if not gata

&#x20;     then

&#x20;       for j:=1 to n div 2 do

&#x20;       begin

&#x20;         if (x=6) or (x=0)

&#x20;         then

&#x20;         begin gata:=true; Break end;

&#x20;         a\[2\*i-1,2\*j-1]:='.';

&#x20;         a\[2\*i,2\*j-1]:='.';

&#x20;         a\[2\*i-1,2\*j]:='.';

&#x20;         a\[2\*i,2\*j]:='.';

&#x20;         Dec(x,4);

&#x20;         if (x=6) or (x=0)

&#x20;         then

&#x20;         begin gata:=true; Break end

&#x20;       end;

&#x20;       if x=6

&#x20;       then

&#x20;       begin

&#x20;         if a\[n-3,n]<>'.'

&#x20;         then

&#x20;         begin

&#x20;           a\[n-2,n-1]:='.';

&#x20;           a\[n-2,n]:='.';

&#x20;           a\[n-1,n]:='.';

&#x20;           a\[n-1,n-2]:='.';

&#x20;           a\[n,n-2]:='.';

&#x20;           a\[n,n-1]:='.'

&#x20;         end

&#x20;         else

&#x20;         begin

&#x20;           a\[n-2,n-1]:='o';

&#x20;           a\[n-2,n]:='o';

&#x20;           for i:=n-5 to n-3 do

&#x20;           begin

&#x20;             a\[n-1,i]:='.';

&#x20;             a\[n,i]:='.';

&#x20;             a\[n-1,n]:='.';

&#x20;             a\[n,n-1]:='.'

&#x20;           end

&#x20;         end

&#x20;       end;

&#x20;       for i:=1 to n do

&#x20;       begin

&#x20;         for j:=1 to n do Write(a\[i,j]);

&#x20;         Writeln

&#x20;       end

&#x20; end;

&#x20; Close(output)

End.

```



\---



\## P059904: Furtunã în Balcani



\*Sabãu Florin, clasa a XI-a, Reºiþa\*



Pentru aceastã problemã am folosit algoritmul "fill". Pentru început se umple exteriorul "taberelor" cu un alt caracter ('o') pentru a diferenþia exteriorul de interiorul taberelor. Se porneºte din punctul (1,1) deoarece se ºtie din problemã cã taberele nu ating marginea. Urmeazã apoi o parcurgere a matricei: când se întâlneºte sârma ghimpatã ('X') se umple exteriorul taberei (caracterul 'o') pe direcþiile N, S, V, E cu mine ('M').



În final se tipãreºte în fiºierul de ieºire matricea.



\### Listing: `BALCANI.PAS`



```pascal

{$m 65000,0,0}

var m,n,i,j:Integer;

&#x20;   a:array\[1..100,1..100] of Char;

&#x20;   x,y:Integer;

&#x20;   cul1,cul2:Char;



procedure citeste;

begin

&#x20; Assign(input,'NATO.IN');

&#x20; Reset(input);

&#x20; Readln(m,n);

&#x20; for i:=1 to m do

&#x20; begin

&#x20;   for j:=1 to n do Read(a\[i,j]);

&#x20;   Readln

&#x20; end;

&#x20; Close(input);

&#x20; Assign(output,'NATO.OUT');

&#x20; Rewrite(output)

end;



procedure fill;

begin

&#x20; if a\[x,y]<>cul1 then Exit;

&#x20; a\[x,y]:=cul2;

&#x20; Inc(x); fill; Dec(x);

&#x20; Inc(y); fill; Dec(y);

&#x20; Dec(x); fill; Inc(x);

&#x20; Dec(y); fill; Inc(y)

end;



Begin

&#x20; citeste;

&#x20; x:=1; y:=1; cul1:='.'; cul2:='o';

&#x20; fill;

&#x20; for x:=1 to m do

&#x20;   for y:=1 to n do

&#x20;   begin

&#x20;     if a\[x,y]='X'

&#x20;     then

&#x20;     begin

&#x20;       if a\[x-1,y]='o' then a\[x-1,y]:='M';

&#x20;       if a\[x,y-1]='o' then a\[x,y-1]:='M';

&#x20;       if a\[x+1,y]='o' then a\[x+1,y]:='M';

&#x20;       if a\[x,y+1]='o' then a\[x,y+1]:='M'

&#x20;     end

&#x20;   end;

&#x20;   for x:=1 to m do

&#x20;   begin

&#x20;     for y:=1 to n do

&#x20;       if a\[x,y]='o' then Write('.')

&#x20;                    else Write(a\[x,y]);

&#x20;       Writeln

&#x20;   end;

&#x20;   Close(output)

End.

```



\---



\## P059905: Semne



\*Sabãu Florin, clasa a XI-a, Reºiþa\*



Nu se poate obþine o expresie în cazul în care n este mai mic decât 3. Pentru n≥3 se observã cã folosind succesiunea ++--++--... pentru un numãr de forma 4k+3 se obþine 0. Pentru un numãr de forma 4k+1, folosind aceeaºi succesiune de operatori, am obþine 1, deci trebuie sã micºorãm expresia cu o unitate. De aceea vom substitui începutul expresiei +1+2 (=3) cu +1\*2 (=2), în rest aceasta rãmâne neschimbatã. Pentru 4k vom folosi înºiruirea:



```text

+-+-...+--+...-+-+

```



în care primul ºi ultimul termen sunt anulaþi de al doilea ºi penultimul etc. Pentru 4k+2 vom porni de la aceeaºi înºiruire de operatori ca ºi la 4k. Aici avem 2 termeni în plus, a cãror diferenþã este de 1 (sau -1). Dacã pentru aceºti ultimi termeni se foloseºte -+, atunci trebuie sã anulãm acest 1 la începutul expresiei. Înlocuim deci +1-2 (=-1) cu -1\*2 (=-2).



\### Listing: `SEMNE.PAS`



```pascal

const semn:array\[0..1] of Char=('+','-');

var n:Longint;



procedure citeste;

begin

&#x20; Assign(input,'ZERO.IN'); Reset(input);

&#x20; Readln(n); Close(input)

end;



function neg(x:Byte):Byte;

begin x:=(x+1) mod 2; neg:=x end;



procedure rezolva;

var i:Longint;

&#x20;   sem:0..1;

begin

&#x20; case (n mod 4) of

&#x20; 1: begin

&#x20;      Write('+\*'); i:=3; sem:=1;

&#x20;      while i<n do

&#x20;      begin

&#x20;        Write(semn\[sem],semn\[sem]);

&#x20;        i:=i+2; sem:=neg(sem)

&#x20;      end;

&#x20;      Writeln(semn\[sem])

&#x20;    end;

&#x20; 2: begin

&#x20;      Write('-\*');

&#x20;      sem:=0;

&#x20;      for i:=3 to (n-2) div 2 do

&#x20;      begin Write(semn\[sem]);

&#x20;            sem:=neg(sem)

&#x20;      end;

&#x20;      sem:=neg(sem);

&#x20;      for i:=1 to (n-2) div 2 do

&#x20;      begin Write(semn\[sem]);

&#x20;            sem:=neg(sem)

&#x20;      end;

&#x20;      Writeln('-+')

&#x20;    end;

&#x20; 3: begin

&#x20;      for i:=1 to n div 4 do Write('++--');

&#x20;      Writeln('++-')

&#x20;    end;

&#x20; 0: begin

&#x20;      for i:=1 to n div 4 do Write('+-');

&#x20;      for i:=1 to n div 4 do Write('-+')

&#x20;    end

&#x20; end

end;



Begin

&#x20; citeste;

&#x20; n:=12;

&#x20; if n<3 then Writeln('NU') else rezolva;

&#x20; Close(output)

End.

```



\---



\## P059907: Vile



\*Andrei Vancea, student Universitatea Tehnicã, Cluj\*



Problema este rezolvatã folosind metoda Branch\&Bound. Pentru fiecare configuraþie se reþine camera curentã ºi starea becurilor din cele n camere. Având în vedere faptul cã numãrul de camere este mai mic decât 16 starea becurilor se poate reþine într-un word (un bit pentru fiecare bec). Dintr-o configuraþie se poate trece în alta prin trecerea în altã camerã sau schimbarea stãrii unui bec conform condiþiilor din enunþ. În tabloul ajuns sunt marcate configuraþiile care s-au expandat pentru a nu se mai expanda încã o datã.



Existenþa unui numãr mic de configuraþii (11\*2^11) garanteazã gãsirea soluþiei într-un timp rezonabil.



\### Listing: `VILE.PAS`



```pascal

{$M 65384,0,655360}

program vile;

type plista=^lista;

&#x20;    lista=record

&#x20;           camera:Byte;

&#x20;           becuri,nrmut:Word;

&#x20;           urm,pred:plista;

&#x20;         end;



var n,i,c:Byte;

&#x20;   nr,nr1,nr2:array\[1..11] of Byte;

&#x20;   vec,ap,st:array\[1..11,1..11] of Byte;

&#x20;   ajuns:array\[1..11,1..1 shl 11] of Boolean;

&#x20;   l,k:Word;

&#x20;   prim,ultim,cr,p:plista;

&#x20;   gasitsolutie:Boolean;



procedure Citire;

var f:Text;

&#x20;   i,j:Byte;

begin

&#x20; Assign(f,'VILA.IN'); Reset(f);

&#x20; Readln(f,n);

&#x20; for i:=1 to n do

&#x20; begin

&#x20;   Read(f,nr\[i]);

&#x20;   for j:=1 to nr\[i] do Read(f,vec\[i,j])

&#x20; end;

&#x20; for i:=1 to n do

&#x20; begin

&#x20;   Read(f,nr1\[i]);

&#x20;   for j:=1 to nr1\[i] do Read(f,ap\[i,j])

&#x20; end;

&#x20; for i:=1 to n do

&#x20; begin

&#x20;   Read(f,nr2\[i]);

&#x20;   for j:=1 to nr2\[i] do Read(f,st\[i,j])

&#x20; end;

&#x20; Close(f)

end;



procedure scriere;

var f:Text;

&#x20;   i:Byte;

&#x20; procedure Mutari(p:plista);

&#x20; var i:Byte;

&#x20; begin

&#x20;   if p=prim then Exit;

&#x20;   Mutari(p^.pred);

&#x20;   if p^.camera<>p^.pred^.camera

&#x20;   then Writeln(f,'m',p^.camera)

&#x20;   else

&#x20;     for i:=0 to n-1 do

&#x20;       if (p^.becuri and (1 shl i)=0) and

&#x20;          (p^.pred^.becuri and (1 shl i)<>0)

&#x20;       then begin Writeln(f,'s',i+1); Break end

&#x20;       else

&#x20;         if (p^.becuri and (1 shl i)<>0) and

&#x20;            (p^.pred^.becuri and (1 shl i)=0)

&#x20;         then begin

&#x20;           Writeln(f,'a',i+1); Break

&#x20;         end

&#x20; end;

begin

&#x20; Assign(f,'VILA.OUT'); Rewrite(f);

&#x20; if cr=nil

&#x20; then Writeln(f,'Nu exista solutie')

&#x20; else

&#x20; begin

&#x20;   Writeln(f,cr^.nrmut);

&#x20;   Mutari(cr)

&#x20; end;

&#x20; Close(f)

end;



Begin

&#x20; Citire;

&#x20; Fillchar(ajuns,Sizeof(ajuns),0);

&#x20; ajuns\[1,1]:=true;

&#x20; l:=1;

&#x20; new(prim);

&#x20; prim^.camera:=1; prim^.becuri:=1;

&#x20; prim^.nrmut:=0; prim^.urm:=nil;

&#x20; prim^.pred:=nil; ultim:=prim;

&#x20; cr:=prim; gasitsolutie:=false;

&#x20; while cr<>nil do

&#x20; begin

&#x20;   c:=cr^.camera;

&#x20;   for i:=1 to nr\[c] do

&#x20;     if (cr^.becuri and

&#x20;     (1 shl (vec\[c,i]-1))<>0) and

&#x20;        (not ajuns\[vec\[c,i],cr^.becuri])

&#x20;     then

&#x20;     begin

&#x20;       ajuns\[vec\[c,i],cr^.becuri]:=true;

&#x20;       New(p);

&#x20;       p^.urm:=nil;

&#x20;       p^.pred:=cr;

&#x20;       p^.camera:=vec\[c, i];

&#x20;       p^.becuri:=cr^.becuri;

&#x20;       ultim^.urm:=p;

&#x20;       ultim:=p;

&#x20;       p^.nrmut:=cr^.nrmut+1;

&#x20;       if (vec\[c,i]=n) and

&#x20;          (p^.becuri=1 shl (n-1))

&#x20;       then

&#x20;         begin

&#x20;           cr:=p;

&#x20;           gasitsolutie:=true;

&#x20;           Break

&#x20;         end

&#x20;     end;

&#x20;     if gasitsolutie then Break;

&#x20;     for i:=1 to nr1\[c] do

&#x20;     if (cr^.becuri and

&#x20;     (1 shl (ap\[c,i]-1))=0) and

&#x20;        (not ajuns\[c, cr^.becuri+

&#x20;        (1 shl (ap\[c,i]-1))])



&#x20;     then

&#x20;     begin

&#x20;     ajuns\[c, cr^.becuri+

&#x20;         (1 shl (ap\[c,i]-1))]:=true;

&#x20;     New(p); p^.urm:=nil;

&#x20;     p^.pred:=cr;

&#x20;     p^.camera:=cr^.camera;

&#x20;     p^.becuri:=cr^.becuri+

&#x20;         (1 shl (ap\[c,i]-1));

&#x20;     p^.nrmut:=cr^.nrmut+1;

&#x20;     ultim^.urm:=p; ultim:=p

&#x20;   end;

&#x20;   for i:=1 to nr2\[c] do

&#x20;     if (cr^.becuri and

&#x20;     (1 shl (st\[c,i]-1))<>0) and

&#x20;        (not ajuns\[c, cr^.becuri-

&#x20;        (1 shl (st\[c,i]-1))])

&#x20;     then

&#x20;     begin

&#x20;       ajuns\[c, cr^.becuri-

&#x20;                    (1 shl (st\[c,i]-1))]:=true;

&#x20;       New(p); p^.urm:=nil; p^.pred:=cr;

&#x20;       p^.camera:=cr^.camera;

&#x20;       p^.becuri:=cr^.becuri-

&#x20;                       (1 shl (st\[c,i]-1));

&#x20;       p^.nrmut:=cr^.nrmut+1;

&#x20;       ultim^.urm:=p; ultim:=p;

&#x20;       if (c=n)and(p^.becuri=1 shl (n-1))

&#x20;       then

&#x20;       begin

&#x20;         cr:=p; gasitsolutie:=true;

&#x20;         Break

&#x20;       end

&#x20;     end;

&#x20;   if gasitsolutie then Break;

&#x20;   cr:=cr^.urm

&#x20; end

End.

```



\---



\## P059915: Peisaje



\*Andrei Vancea, student Universitatea Tehnicã, Cluj\*



Problema este rezolvatã prin programare dinamicã.



Se definesc:



\* a\[i,j,1] - numãrul de posibilitãþi ca dupã trasarea a i caractere sã se ajungã la înãlþimea j ºi, în plus, condiþia din enunþ sã fie îndeplinitã (adicã existã cel puþin un munte cu înãlþimea mai mare sau egalã cu k);

\* a\[i,j,0] - numãrul de posibilitãþi ca dupã trasarea a i caractere sã se ajungã la înãlþimea j ºi condiþia din enunþ sã nu fie îndeplinitã.



Soluþia problemei va fi a\[2\*n,0,1]. Valorile tabloului a se vor calcula în urmãtorul mod:



\*\*dacã\*\* k=1

\*\*atunci\*\* \*a\[1,1,1]=1\*

\*\*altfel\*\* \*a\[1,1,1]=0\*

a\[1,1,0]=1-a\[1,1,1];



\*\*dacã\*\* \*j=k\*

\*\*atunci\*\* \*a\[i,j,1]=a\[i-1,j-1,0]+a\[i-1,j-1,1]+a\[i-1,j+1,1]\*

a\[i,j,0]=0



\*\*dacã\*\* j<>k

\*\*atunci\*\* a\[i,j,1]=a\[i-1,j-1,1]+a\[i-1,j+1,1];

a\[i,j,0]=a\[i-1,j-1,0]+a\[i-1,j+1,0];



\### Listing: `PEISAJE.PAS`



```pascal

{$M 16384,0,655360}

program peisaje;

var a:array\[-1..62,-1..31,0..1] of Comp;

&#x20;   f:Text;

&#x20;   n,k,i,j:Byte;

Begin

&#x20; Assign(f,'PEISAJ.IN'); Reset(f);

&#x20; Readln(f,n,k);

&#x20; Close(f); Fillchar(a,Sizeof(a),0);

&#x20; if k=1

&#x20; then a\[1,1,1]:=1

&#x20; else a\[1,1,0]:=1;

&#x20; for i:=2 to 2\*n do

&#x20;   for j:=0 to n do

&#x20;   begin

&#x20;     if j=k

&#x20;     then a\[i,j,1]:=a\[i-1,j-1,0]+

&#x20;                     a\[i-1,j-1,1]+a\[i-1,j+1,1]

&#x20;     else

&#x20;     begin

&#x20;       a\[i,j,1]:=a\[i-1,j-1,1]+a\[i-1,j+1,1];

&#x20;       a\[i,j,0]:=a\[i-1,j-1,0]+a\[i-1,j+1,0]

&#x20;     end

&#x20;   end;

&#x20; Assign(f,'PEISAJ.OUT'); Rewrite(f);

&#x20; Writeln(f,a\[2\*n,0,1]:0:0);

&#x20; Close(f)

End.

```



\---



\## P59923: Un dreptunghi



\*Andrei Vancea, student Universitatea Tehnicã, Cluj\*



Pentru fiecare linie se contorizeazã numãrul de bile aruncate despre care suntem informaþi cã s-au întors ºi cele despre care ni se spune cã nu s-au întors, apoi calculãm diferenþa acestora. Aceastã diferenþã se va reþine în ºirul a. Problema se reduce la determinarea unei subsecvenþe de sumã maximã din ºirul a. Din extremitãþile acelei subsecvenþe se calculeazã valorile L ºi H. Dacã suma maximalã calculatã este negativã atunci H va fi 0. Acelaºi algoritm se aplicã ºi pentru coloane, calculându-se C ºi W.



\### Listing: `DREPTUNGHI.PAS`



```pascal

program dreptunghi;

type sir=array\[1..20000] of Integer;

var l,c,h,w,m,n,q,r,i,k,b:Word;

&#x20;   a,s,pred:^sir;

&#x20;   f:Text;

Begin

&#x20; New(a);

&#x20; Fillchar(a^,Sizeof(a^),0);

&#x20; New(s);

&#x20; Fillchar(s^,Sizeof(s^),0);

&#x20; New(pred);

&#x20; Fillchar(pred^,Sizeof(pred^),0);

&#x20; Assign(f,'DREPT.IN'); Reset(f);

&#x20; Readln(f,m,n); Readln(f,q);

&#x20; for i:=1 to q do

&#x20; begin

&#x20;   Readln(f,k,b);

&#x20;   if b=0 then Dec(a^\[k])

&#x20;          else Inc(a^\[k])

&#x20; end;

&#x20; s^\[1]:=a^\[1];

&#x20; pred^\[1]:=1;

&#x20; for i:=2 to m do

&#x20;   if s^\[i-1]>=0

&#x20;   then

&#x20;   begin

&#x20;     s^\[i]:=s^\[i-1]+a^\[i];

&#x20;     pred^\[i]:=pred^\[i-1]

&#x20;   end

&#x20;   else

&#x20;   begin

&#x20;     s^\[i]:=a^\[i];

&#x20;     pred^\[i]:=i

&#x20;   end;

&#x20; b:=1;

&#x20; for i:=2 to m do

&#x20; if (s^\[b]<s^\[i]) or ((s^\[b]=s^\[i])

&#x20;     and (b-pred^\[b]<i-pred^\[i]))

&#x20; then b:=i;

&#x20;     l:=pred^\[b];

&#x20;     if s^\[b]>=0 then h:=b-pred^\[b]+1

&#x20;            else h:=0;

&#x20; Fillchar(a^,Sizeof(a^),0);

&#x20; Fillchar(s^,Sizeof(s^),0);

&#x20; Fillchar(pred^,Sizeof(pred^),0);

&#x20; Readln(f,r);

&#x20; for i:=1 to r do

&#x20; begin

&#x20;   Readln(f,k,b);

&#x20;   if b=0 then Dec(a^\[k])

&#x20;          else Inc(a^\[k])

&#x20; end;

&#x20; s^\[1]:=a^\[1];

&#x20; pred^\[1]:=1;

&#x20; for i:=2 to m do

&#x20;   if s^\[i-1]>=0

&#x20;     then

&#x20;     begin

&#x20;       s^\[i]:=s^\[i-1]+a^\[i];

&#x20;       pred^\[i]:=pred^\[i-1]

&#x20;     end

&#x20;     else

&#x20;     begin s^\[i]:=a^\[i]; pred^\[i]:=i end;

&#x20; b:=1;

&#x20; for i:=2 to m do

&#x20;   if (s^\[b]<s^\[i]) or ((s^\[b]=s^\[i])

&#x20;     and (b-pred^\[b]<i-pred^\[i]))

&#x20;   then b:=i;

&#x20; c:=pred^\[b];

&#x20; if s^\[b]>=0 then w:=b-pred^\[b]+1

&#x20;            else w:=0;

&#x20; Close(f);

&#x20; Assign(f,'DREPT.OUT'); Rewrite(f);

&#x20; Writeln(f,l,' ', c,' ',h,' ',w);

&#x20; Close(f)

End.

```



\---



\## P059924: Submulþimi



\*Andrei Vancea, student Universitatea Tehnicã, Cluj\*



Se traverseazã ºirul ºi se marcheazã în tabloul a sumele ce se pot obþine din submulþimi ale ºirului cu elemente având indicele mai mic sau egal decât indicele elementului curent. Pentru fiecare sumã astfel marcatã se reþine elementul cu indice maxim al unei submulþimi având acea sumã. Dacã suma ce trebuie marcatã a fost marcatã înainte de a se ajunge la elementul curent înseamnã cã s-a gãsit o soluþie ºi se afiºeazã. Deoarece tabloul a are dimensiunea de 400000 de octeþi (nu încape într-un segment de memorie) se reprezintã ca un ºir de pointeri. Se observã cã algoritmul funcþioneazã mai rapid dacã ºirul este ordonat crescãtor. De aceea se ordoneazã înainte.



\### Listing: `SUBM.PAS`



```pascal

program submultimi;

type sir = array\[0..49999] of Byte;

var a:array\[1..30] of Longint;

&#x20;   s:array\[0..7] of ^sir;

&#x20;   l1,l2,m,i:Byte;

&#x20;   j,max,maxx,k,suma:Longint;

&#x20;   sol1,sol2:array\[1..30] of Byte;



procedure citire;

var f:Text;

&#x20;   i:Byte;

begin

&#x20; Assign(f,'SUB.IN'); Reset(f);

&#x20; Readln(f,m);

&#x20; suma:=0;

&#x20; for i:=1 to m do

&#x20; begin

&#x20;   Read(f,a\[i]);

&#x20;   Inc(suma,a\[i])

&#x20; end;

&#x20; Close(f)

end;



procedure scriere;

var f:Text;

&#x20;   i:Byte;

begin

&#x20; Assign(f,'SUB.OUT'); Rewrite(f);

&#x20; Writeln(f,l1);

&#x20; for i:=1 to m do

&#x20;   if sol1\[i]=1 then Write(f,a\[i], ' ');

&#x20; Writeln(f);

&#x20; Writeln(f,l2);

&#x20; for i:=1 to m do

&#x20;   if sol2\[i]=1 then Write(f,a\[i],' ');

&#x20; Writeln(f);

&#x20; Close(f);

&#x20; Halt

end;



procedure scrienu;

var f:Text;

begin

&#x20; Assign(f,'SUB.OUT'); Rewrite(f);

&#x20; Writeln(f,'NU');

&#x20; Close(f);

&#x20; Halt

end;



Begin

&#x20; Citire;

&#x20; for i:=0 to 7 do

&#x20; begin

&#x20;   New(s\[i]);

&#x20;   Fillchar(s\[i]^,Sizeof(s\[i]^),0)

&#x20; end;

&#x20; s\[0]^\[0]:=31;

&#x20; max:=0;

&#x20; for i:=1 to m-1 do

&#x20;   for j:=i+1 to m do

&#x20;     if a\[i]>a\[j]

&#x20;     then

&#x20;     begin

&#x20;       a\[i]:=a\[i] xor a\[j];

&#x20;       a\[j]:=a\[i] xor a\[j];

&#x20;       a\[i]:=a\[i] xor a\[j]

&#x20;     end;

&#x20; for i:=1 to m do

&#x20; begin

&#x20;   Writeln(i);

&#x20;   maxx:=max;

&#x20;   for j:=0 to max do

&#x20;     if (s\[j div 50000]^\[j mod 50000]<>0) and

&#x20;       (s\[j div 50000]^\[j mod 50000]<>i)

&#x20;     then

&#x20;     begin

&#x20;       if s\[(j+a\[i]) div 50000]^\[(j+a\[i])

&#x20;            mod 50000]=0

&#x20;       then

&#x20;       begin

&#x20;         s\[(j+a\[i]) div 50000]^\[(j+a\[i])

&#x20;             mod 50000]:=i;

&#x20;         if (j+a\[i]>maxx)

&#x20;         then maxx:=j+a\[i];

&#x20;       end

&#x20;       else

&#x20;       begin

&#x20;         Fillchar(sol1,Sizeof(sol1),0);

&#x20;         Fillchar(sol2,Sizeof(sol2),0);

&#x20;         l1:=0;

&#x20;         l2:=0;

&#x20;         k:=j;

&#x20;         sol1\[i]:= 1;

&#x20;         while k<>0 do

&#x20;         begin

&#x20;           sol1\[s\[k div 50000]^

\[k mod 50000]]:=1;

&#x20;           Dec(k,a\[s\[k div 50000]^

\[k mod 50000]])

&#x20;           end;

&#x20;           k:=j+a\[i];

&#x20;           while k<>0 do

&#x20;           begin

&#x20;             sol2\[s\[k div 50000]^

\[k mod 50000]]:=1;

&#x20;             Dec(k,a\[s\[k div 50000]^

&#x20;  \[k mod 50000]])

&#x20;           end;

&#x20;           for k:=1 to m do

&#x20;             if (sol1\[k]=1) and (sol2\[k]=1)

&#x20;             then

&#x20;             begin

&#x20;               sol1\[k]:=0;

&#x20;               sol2\[k]:=0

&#x20;             end

&#x20;             else

&#x20;               if sol1\[k]=1

&#x20;               then Inc(l1)

&#x20;               else

&#x20;                 if sol2\[k]=1

&#x20;                 then Inc(l2);

&#x20;             scriere

&#x20;           end

&#x20;       end;

&#x20;   max:=maxx;

&#x20;   if max>suma div 2

&#x20;   then max:=suma div 2;

&#x20; end;

&#x20; scrienu

End.

```



