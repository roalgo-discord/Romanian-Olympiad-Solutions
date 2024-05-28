# Soluții

## Cazane

Cand avem nevoie de un cazan nou, este mereu optim sa alegem cel mai mare cazan disponibil.

Asadar, putem ordona cazanele descrescator, si, cand avem nevoie intr-o zi de un cazan suplimentar, sa il alegem pe cel mai mare disponibil. Puteti citi solutia oficiala [aici](./cazane/sol.cpp).

Complexitate: `O(n log n)`.

## Felinare

O soluție greedy este sa plecam de la prima casa (casa 1), si sa ne deplasam catre ultima casa (casa N). Cand ajungem in fata unei case ne-iluminate, vom alege felinarul care ilumineaza cel mai mult in fata, si ne vom deplasa catre urmatoarea casa ne-iluminata.

Puteti citi solutia oficiala [aici](./felinare/felinare.cpp).

## Tren

Sortam șinele, crescator dupa peronul din orasul X, si in caz de egalitate, crescator dupa peronul din orasul Y.

Doua sine `(a, b)` si `(c, d)`, cu `(a, b) < (c, d)` conform ordonarii descrise mai sus, se intersecteaza daca si numai daca `b > d`.

Asadar, putem reduce problema la a gasi cate inversiuni exista intr-un vector de numere.

Aceasta problema se poate rezolva cu un arbore indexat binar, in `O(n log n)`.

Pentru mai multe detalii, puteti vedea sursa oficiala [aici](./tren/sol.cpp).

## Vopsea

Vom rezolva problema folosind o solutie de tipul meet-in-the-middle.

Vom imparti cele `N <= 40` galeti in doua jumatati, si vom calcula toate combinatiile de culori pentru fiecare jumatate, dupa care le vom combina.

Putem combina o galeata cu vopseaua `(a, b, c)` cu o alta galeata cu vopseaua `(d, e, f)` daca si numai daca `a + d = b + e = c + f`, echivalent cu:

`(b + e) - (a + d) = (c + f) - (a + d) = 0`, echiavalent cu:
`(b - a) + (e - d) = (c - a) + (f - d) = 0`.

Asadar, putem transforma galetile `(a, b, c)` in `(b - a, c - a)`. Doua galeți se pot combina daca una din ele este negativul celeilalte.

Puteti citi solutia oficiala [aici](./vopsea/sol.cpp).