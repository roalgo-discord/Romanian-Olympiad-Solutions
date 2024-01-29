/**
 * Author: Catalin Francu
 *
 * Define a fuzzy list as a doubly linked list where the left and right
 * pointers are possibly switched. Basically, we treat these pointers like
 * an adjacency list. To iterate over this list, we also need to remember
 * the previous node so that we don't go back the wrong way.
 *
 * Define a major fold as a fold that extends past the left end of the paper.
 * Other folds are called minor.
 *
 * Define an epoch as a sequence of folds beginning with a major fold and
 * continuing with minor folds only. The minor folds up to the first major
 * fold are epoch 0.
 *
 * Define a tower as a whole stack of paper squares at any point in time.
 *
 * We use fuzzy lists to store towers because that allows inversions in O(1):
 * we simply switch the pointers to the first and last element. We can also
 * merge towers in O(1) by linking together their top elements.
 *
 * Similarly, we store the paper layout as a fuzzy list of towers. This allows
 * for O(1) inversions for major folds: we merge towers while both segments
 * still have elements, then reverse the leftover segment at the right and
 * prepend it to the tower list.
 *
 * Leftover towers in a major fold should be reversed, but we cannot afford
 * to visit each one individually. Instead, on each tower we store the epoch
 * at which the tower was last known to be upright (proper orientation).
 * When we later visit the tower, either during a minor fold or at the end,
 * we fix the tower by reversing it if an odd number of epochs have elapsed.
 **/

#include <stdio.h>

#define MAX_N 1000000
#define NIL -1

typedef struct {
  int bottom, top; /* pointers to the bottom/top squares */
  int height;
  int epoch; /* last epoch when the tower was known to be upright */
  int adj[2]; /* fuzzy horizontal pointers (neighboring towers) */
} fuzzy;

fuzzy t[MAX_N + 1];

/**
 * Use the same data structure for vertical (square) lists as well. We
 * really only need the adjacency lists and we waste the other fields,
 * but we reuse the code for traversals and pointer manipulation.
 **/
fuzzy s[MAX_N + 1];

int epoch;

/* change a neighbor of k from "from" to "to" */
void changePtr(int k, int from, int to, fuzzy *t) {
  int ptr = (t[k].adj[0] == from) ? 0 : 1;
  t[k].adj[ptr] = to;
}

/* advance current and previous pointers in the tower list */
void advance(int *current, int *prev, fuzzy *t) {
  /* follow the pointer that does not take us back to prev */
  int tmp = *current;
  int ptr = (t[*current].adj[0] == *prev) ? 1 : 0;
  *current = t[*current].adj[ptr];
  *prev = tmp;
}

/**
 * Returns the kth tower counting from head, which is counted as #0.
 * Returns the index of the kth tower in result and the k-1st in prev.
 **/
void kthElement(int head, int k, int *result, int *prev) {
  *result = head;
  *prev = NIL;
  while (k--) {
    advance(result, prev, t);
  }
}

/* fix a tower if it went uninverted through an odd number of epochs */
void fixTower(int k) {
  if ((epoch - t[k].epoch) % 2) {
    int tmp = t[k].top;
    t[k].top = t[k].bottom;
    t[k].bottom = tmp;
    t[k].epoch = epoch;
  }
}

/* invert the src tower squares and add them on top of the dest tower */
void mergeTowers(int src, int dest, int major) {
  fixTower(src);
  fixTower(dest);

  /* make the tops of both towers point to one another */
  changePtr(t[src].top, NIL, t[dest].top, s);
  changePtr(t[dest].top, NIL, t[src].top, s);

  t[dest].top = t[src].bottom;
  t[dest].height += t[src].height;
  t[dest].epoch = epoch + major; /* increment the epoch during major folds */
}

void printSquares(int first, int top) {
  int l = first;
  int prev = NIL;
  while (l != NIL) {
    printf("%d ", top ? t[l].top : t[l].bottom);
    advance(&l, &prev, t);
  }
  printf("\n");
}

int main() {
  int n, numOps, i;

  scanf("%d %d", &n, &numOps);

  /* initialize n towers of one square each */
  for (i = 1; i <= n; i++) {
    s[i].adj[0] = s[i].adj[1] = NIL;
    t[i].bottom = t[i].top = i;
    t[i].height = 1;
    t[i].epoch = 0;
    t[i].adj[0] = i - 1;
    t[i].adj[1] = i + 1;
  }
  t[1].adj[0] = NIL;
  t[n].adj[1] = NIL;

  int first = 1;
  int last = n;
  int length = n;
  epoch = 0;

  while (numOps--) {
    int where, left, right;
    scanf("%d", &where);

    if (where == 0) { /* Special case for complete inversions */
      epoch++;
      int tmp = first;
      first = last;
      last = tmp;
    } else {
      int major = 2 * where < length;

      /* make left and right point to elements on either side of the */
      /* starting point */
      if (major) {
        kthElement(first, where, &right, &left);
      } else {
        kthElement(last, length - where, &left, &right);
      }

      /* store previous pointers for left and right so we know which way to advance */
      int prevL = right;
      int prevR = left;
      int saveLeft = left;
      int saveRight = right; /* we'll need these later */

      while (left != NIL && right != NIL) {
        /* fold right over left */
        mergeTowers(right, left, major);
        advance(&left, &prevL, t);
        advance(&right, &prevR, t);
        length--;
      }

      /* for major folds, move the remaining towers from the end to the front */
      if (right != NIL) {
        epoch++;

        changePtr(first, NIL, right, t);
        changePtr(right, prevR, first, t);

        first = last;
      }

      /* recompute last and terminate the list after it */
      last = saveLeft;
      changePtr(last, saveRight, NIL, t);
    }
  }

  /* fix any towers that still need fixing */
  int left = first;
  int prev = NIL;
  while (left != NIL) {
    fixTower(left);
    advance(&left, &prev, t);
  }

  /* find the tallest tower */
  int tallest = first;
  int l = first;
  prev = NIL;
  while (l != NIL) {
    if (t[l].height > t[tallest].height) {
      tallest = l;
    }
    advance(&l, &prev, t);
  }

  /* print the tallest tower */
  l = t[tallest].bottom;
  prev = NIL;
  while (l != NIL) {
    printf("%d ", l);
    advance(&l, &prev, s);
  }
  printf("\n");

  /* print the bottom and top squares */
  printSquares(first, 0);
  printSquares(first, 1);

  return 0;
}