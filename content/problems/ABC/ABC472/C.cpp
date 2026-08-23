#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
  long long N, M, K;
  cin >> N >> M >> K;
  vector<int> A(N);
  rep(i, N) cin >> A.at(i);

  long long total = 0;
  vector<long long> eat(N, 0);

  rep(i, N) {
    if (total + A.at(i) <= K) {
      total += A.at(i);
      eat.at(i) = A.at(i);
      cout << "Yes" << endl;
    } else {
      cout << "No" << endl;
    }
    if (i >= M - 1) total -= eat.at(i - M + 1);
  }
  return 0;
}
