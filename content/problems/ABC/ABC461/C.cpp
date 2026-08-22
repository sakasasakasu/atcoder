#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N, K, M;
    cin >> N >> K >> M;
    vector<pair<int, long long>> CV(N);
    rep(i, N) cin >> CV[i].second >> CV[i].first;

    sort(CV.rbegin(), CV.rend());

    vector<bool> isHold(N + 1, false);
    int colorCount = 0;
    int amountCount = 0;
    long long ans = 0;

    for (int i = 0; i < N; i++) {
        if (amountCount == K) {
            break;
        } else if (colorCount >= M || amountCount <= K - M) {
            ans += CV.at(i).first;
            amountCount++;
            if (isHold.at(CV.at(i).second) == false) {
                colorCount++;
                isHold.at(CV.at(i).second) = true;
            }
        } else if (isHold.at(CV.at(i).second) == false) {
            ans += CV.at(i).first;
            amountCount++;
            colorCount++;
            isHold.at(CV.at(i).second) = true;
        }
    }

    cout << ans << endl;
}
