#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
  int N;
  cin >> N;
  vector<int> A(N);
  rep(i, N) cin >> A.at(i);
  int ans = 0;

  for (int i = 1; i < N - 1; i++) {
    if (A.at(i) > A.at(i - 1) && A.at(i) > A.at(i + 1)) ans++;
  }

  cout << ans;
}
