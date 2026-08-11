#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main()
{
    int N;
    cin >> N;
    vector<int> P(N), Q(N);
    rep(i, N) cin >> P.at(i);
    rep(i, N) cin >> Q.at(i);

    vector<int> v(N);
    rep(i, N) v.at(i) = i + 1;

    bool count = false;
    int ans = 0;

    do
    {
        if (v == Q)
            break;
        if (count)
            ans++;
        if (v == P)
            count = true;
    } while (next_permutation(v.begin(), v.end()));

    cout << ans;
}
