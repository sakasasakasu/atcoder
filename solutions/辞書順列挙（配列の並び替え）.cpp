#include <bits/stdc++.h>
using namespace std;

int main() {
  vector<int> v = {1, 2, 3};

  do {
    for (int i : v) {
      cout << i << " ";
    }
    cout << endl;

  } while (std::next_permutation(v.begin(), v.end()));
}

/*【出力】
1 2 3
1 3 2
2 1 3
2 3 1
3 1 2
3 2 1
*/
