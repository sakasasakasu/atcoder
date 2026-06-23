#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N;
    cin >> N;
    vector<pair<long long, long long>> HL(N);
    rep(i, N) cin >> HL.at(i).first >> HL.at(i).second;

    vector<long long> maxH(N);
    maxH.at(N - 1) = HL.at(N - 1).first;
    for (int i = N - 2; i >= 0; i--) {
        maxH.at(i) = max(HL.at(i).first, maxH.at(i + 1));
    }

    int Q;
    cin >> Q;
    while(Q--) {
        long long T;
        cin >> T;
        long long ans = 0;
        rep(i, N) {
            if(HL.at(i).second > T) {
                break;
            }
            if(HL.at(i).first > ans) {
                ans = HL.at(i).first;
            }
        }
        cout << ans << endl;
    }
}
