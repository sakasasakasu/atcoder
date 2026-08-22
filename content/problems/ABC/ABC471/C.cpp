#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
  int N;
  cin >> N;
  vector<long long> negative, positive;
  rep(i, N) {
    long long a;
    cin >> a;
    if (a < 0) {
      negative.push_back(a);
    } else {
      positive.push_back(a);
    }
  }
  sort(positive.begin(), positive.end());
  sort(negative.begin(), negative.end(), greater<long long>());

  long long ans = 0;
  long long current = 0;
  int p_idx = 0, n_idx = 0;

  while (p_idx < positive.size() || n_idx < negative.size()) {
    if (p_idx < positive.size() && n_idx < negative.size()) {
      if (abs(positive.at(p_idx) - current) <
          abs(negative.at(n_idx) - current)) {
        ans += abs(positive.at(p_idx) - current);
        current = positive.at(p_idx);
        p_idx++;
      } else {
        ans += abs(negative.at(n_idx) - current);
        current = negative.at(n_idx);
        n_idx++;
      }
    } else if (p_idx < positive.size()) {
      ans += abs(positive.at(p_idx) - current);
      current = positive.at(p_idx);
      p_idx++;
    } else {
      ans += abs(negative.at(n_idx) - current);
      current = negative.at(n_idx);
      n_idx++;
    }
  }

  cout << ans << endl;

  return 0;
}
