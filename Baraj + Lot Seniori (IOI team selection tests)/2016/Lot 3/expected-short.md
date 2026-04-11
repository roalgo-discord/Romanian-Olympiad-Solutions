## Ce trebuie să calculăm ?

Alex extrage $K$ șosete dintr-un sertar cu $N$ șosete.

Fiecare șosetă are:

* o culoare $color_i \in [1 \dots N]$
* o dimensiune – mică ($sizeSmall$) sau mare ($sizeBig$)

În momentul în care în sertar mai rămân $p$ șosete cu dimensiunile $s_1,\dots,s_p$ (fiecare $s_i$ este $sizeSmall$ sau $sizeBig$), șoseta $i$ este aleasă cu probabilitatea

`s_i / (s_1+s_2+...+s_p)`

După ce Alex a luat exact $K$ șosete, dorim probabilitatea ca cel puțin două dintre ele să aibă aceeași culoare (dimensiunea nu contează).

---

## Ideea generală

Problema se poate despărţi în două părţi independente:

1. **Compoziţia dimensiunilor** – câte din cele $K$ șosete sunt mici și câte sunt mari.
2. **Coliziunea de culori** – dată o combinație $(a,b)$ de $a$ mici şi $b$ mari, care este probabilitatea ca toate culorile să fie diferite?

Răspunsul final este:

`Ans = sum_{a+b=K} q[a][b] * (1 - p[a][b])`

unde

* $q[a][b]$ – probabilitatea ca în cele $K$ alegeri să fie exact $a$ șosete mici și $b$ mari
* $p[a][b]$ – probabilitatea ca toate culorile să fie distincte

---

## 2. Probabilitatea de a obține o anumită compoziție $(a,b)$

Numărul total de șosete mici este $A$, iar al celor mari este $B$.

La fiecare pas, dacă încă nu am luat $i$ mici și $j$ mari, rămân:

* $A-i$ mici
* $B-j$ mari

cu greutăţi:

`W_small = (A-i)*sizeSmall, W_big = (B-j)*sizeBig`

Probabilitatea de a alege o șosetă mică:

`W_small / (W_small + W_big)`

iar pentru mare este complementul.

DP-ul:

```text
q[0][0] = 1
for i = 0…A
  for j = 0…B
    // alegem încă o mică
    q[i+1][j] += q[i][j] * ( (A-i)*sizeSmall ) /
                 ( (A-i)*sizeSmall + (B-j)*sizeBig )

    // alegem încă o mare
    q[i][j+1] += q[i][j] * ( (B-j)*sizeBig )  /
                 ( (A-i)*sizeSmall + (B-j)*sizeBig )
````

După $K$ paşi, $q[a][b]$ (cu $a+b=K$) este probabilitatea dorită.

Complexitate: $O(A \cdot B) \le O(N^2)$

---

## 3. Probabilitatea ca toate culorile să fie diferite $p[a][b]$

Pentru fiecare culoare $c$:

* $cntA[c]$ – număr de mici
* $cntB[c]$ – număr de mari

Vrem să alegem $a$ mici și $b$ mari fără repetări de culoare.

---

### DP peste culori

`DP[0][0][0] = 1`

Tranziții:

```text
for each colour c = 1…C
  for a = 0…A
    for b = 0…B
      DP[c][a][b] = DP[c-1][a][b]

      if a>0
        DP[c][a][b] += DP[c-1][a-1][b] * cntA[c] * a

      if b>0
        DP[c][a][b] += DP[c-1][a][b-1] * cntB[c] * b
```

Factorii $a$ și $b$ apar deoarece alegem poziția în aranjament.

---

### Numărul total de aranjamente

`tot[a][b] = A*(A-1)...(A-a+1) * B*(B-1)...(B-b+1)`

Prin urmare:

`p[a][b] = DP[C][a][b] / tot[a][b]`

Complexitate: $O(C \cdot A \cdot B) \le O(N^3)$

---

## 4. Combinarea rezultatelor

Pentru fiecare $(a,b)$ cu $a+b = K$:

```text
contrib = q[a][b] * (1 - p[a][b])
Ans    += contrib
```

unde

`1 - p[a][b]`

este probabilitatea de coliziune.

---

## Complexitate și precizie

* Timp: $O(N^3)$
* Memorie: $\sim O(N^3)$
* Precizie: eroare absolută $\le 10^{-5}$

---

## Ideea cheie

* separăm dimensiunea de culoare
* calculăm independent distribuția $q[a][b]$
* numărăm combinațiile valide cu DP
* combinăm cu legea probabilităților totale

```
