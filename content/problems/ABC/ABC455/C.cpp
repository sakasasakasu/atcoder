#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    int N, K;
    cin >> N >> K;
    map<ll, ll> A;
    
    for (int i = 0; i < N; i++) {
        ll a;
        cin >> a;
        A[a]++;
    }

    vector<ll> sum;
    for (auto [f, s] : A) sum.push_back(f * s);
    sort(sum.begin(), sum.end());
    for(int i = 0; i < K; i++) if (!sum.empty()) sum.pop_back();
    ll ans = reduce(sum.begin(), sum.end());
    cout << ans << endl;
}